import { supabase } from '@/lib/supabase'

// Base Entity Class
class Entity {
  constructor(tableName) {
    this.tableName = tableName
  }

  async create(data) {
    const { data: result, error } = await supabase
      .from(this.tableName)
      .insert([{
        ...data,
        id: globalThis.crypto?.randomUUID() || `${Date.now()}-${Math.random().toString(36)}`,
        created_date: new Date().toISOString(),
        updated_date: new Date().toISOString(),
      }])
      .select()
      .single()

    if (error) throw error
    return result
  }

  async filter(conditions = {}, orderBy = null) {
    let query = supabase.from(this.tableName).select('*')

    Object.entries(conditions).forEach(([key, value]) => {
      query = query.eq(key, value)
    })

    if (orderBy) {
      const isDesc = orderBy.startsWith('-')
      const field = isDesc ? orderBy.substring(1) : orderBy
      query = query.order(field, { ascending: !isDesc })
    }

    const { data, error } = await query
    if (error) throw error
    return data || []
  }

  async get(id) {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    return data
  }

  async update(id, data) {
    const { data: result, error } = await supabase
      .from(this.tableName)
      .update({
        ...data,
        updated_date: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return result
  }

  async delete(id) {
    const { error } = await supabase
      .from(this.tableName)
      .delete()
      .eq('id', id)

    if (error) throw error
    return true
  }

  async count(conditions = {}) {
    let query = supabase
      .from(this.tableName)
      .select('*', { count: 'exact', head: true })

    Object.entries(conditions).forEach(([key, value]) => {
      query = query.eq(key, value)
    })

    const { count, error } = await query
    if (error) throw error
    return count
  }

  // 🟣 הוסף את הפונקציה הזאת בסוף המחלקה
  async list(orderBy = null) {
    return this.filter({}, orderBy)
  }
}

// User Entity
class UserEntity extends Entity {
  constructor() {
    super('user_profiles')
  }

  async me() {
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (error) throw error
    if (!user) throw new Error('Not authenticated')

    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (profileError && profileError.code !== 'PGRST116') throw profileError

    return {
      id: user.id,
      email: user.email,
      role: user.user_metadata?.role || 'user',
      ...profile,
    }
  }
}

export const Venture = new Entity('ventures')
export const User = new UserEntity()
export const VentureMessage = new Entity('venture_messages')
export const BusinessPlan = new Entity('business_plans')
export const BetaTester = new Entity('beta_testers')
export const Budget = new Entity('budgets')
export const CoFounderInvitation = new Entity('co_founder_invitations')
export const FundingEvent = new Entity('funding_events')
export const Investor = new Entity('investors')
export const MasterQuestion = new Entity('master_questions')
export const MVPFeatureFeedback = new Entity('mvp_feature_feedback')
export const PitchAnswer = new Entity('pitch_answers')
export const ProductFeedback = new Entity('product_feedback')
export const PromotionCampaign = new Entity('promotion_campaigns')
export const SuggestedFeature = new Entity('suggested_features')
export const VCFirm = new Entity('vc_firms')
