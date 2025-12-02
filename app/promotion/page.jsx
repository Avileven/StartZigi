"use client"`n`nimport React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import InAppPromotion from '@/components/promotions/InAppPromotion';
import EmailPromotion from '@/components/promotions/EmailPromotion';
import { createPageUrl } from '@/utils';

export default function Promotion() {
  const router = useRouter();
  const urlParams = new URLSearchParams(window.location.search);
  const promotionType = urlParams.get('type');

  useEffect(() => {
    if (!promotionType) {
      navigate(createPageUrl('PromotionCenter'));
    }
  }, [promotionType, navigate]);

  const goBack = () => {
    navigate(createPageUrl('PromotionCenter'));
  };

  if (promotionType === 'in-app') {
    return <InAppPromotion goBack={goBack} />;
  }

  if (promotionType === 'email') {
    return <EmailPromotion goBack={goBack} />;
  }

  return null;
}