# Next.js Migration Script for StartZig
# Save as: migrate.ps1
# Run from: C:\STRARTZIG

Write-Host "Starting Next.js Migration..." -ForegroundColor Green

# Step 1: Create app directory
Write-Host "`nCreating app directory..." -ForegroundColor Yellow
New-Item -Path "app" -ItemType Directory -Force | Out-Null

# Step 2: Create root layout
Write-Host "Creating root layout..." -ForegroundColor Yellow
$rootLayout = @'
import { Toaster } from "@/components/ui/toaster"
import ClientLayout from "./ClientLayout"
import "./globals.css"

export const metadata = {
  title: "StartZig",
  description: "Build your startup",
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <ClientLayout>{children}</ClientLayout>
        <Toaster />
      </body>
    </html>
  )
}
'@
$rootLayout | Out-File -FilePath "app/layout.jsx" -Encoding UTF8

# Step 3: Create home page (root)
Write-Host "Creating home page..." -ForegroundColor Yellow
New-Item -Path "app/home" -ItemType Directory -Force | Out-Null
if (Test-Path "src/pages/CreateVenture.jsx") {
    Copy-Item "src/pages/CreateVenture.jsx" "app/page.jsx"
    Write-Host "  Created app/page.jsx from CreateVenture" -ForegroundColor Green
}

# Step 4: Copy pages
Write-Host "`nCopying pages..." -ForegroundColor Yellow

$pageMappings = @(
    @{Source="Home.jsx"; Target="home"},
    @{Source="Dashboard.jsx"; Target="dashboard"},
    @{Source="BusinessPlan.jsx"; Target="business-plan"},
    @{Source="AngelArena.jsx"; Target="angel-arena"},
    @{Source="VCMarketplace.jsx"; Target="vc-marketplace"},
    @{Source="InviteCoFounder.jsx"; Target="invite-cofounder"},
    @{Source="VenturePitch.jsx"; Target="venture-pitch"},
    @{Source="VentureLanding.jsx"; Target="venture-landing"},
    @{Source="Promotion.jsx"; Target="promotion"},
    @{Source="PromotionReport.jsx"; Target="promotion-report"},
    @{Source="MVPDevelopment.jsx"; Target="mvp-development"},
    @{Source="VentureWelcome.jsx"; Target="venture-welcome"},
    @{Source="ProductFeedback.jsx"; Target="product-feedback"},
    @{Source="EditLandingPage.jsx"; Target="edit-landing-page"},
    @{Source="Community.jsx"; Target="community"},
    @{Source="Pricing.jsx"; Target="pricing"},
    @{Source="AdminDashboard.jsx"; Target="admin"},
    @{Source="TermsOfService.jsx"; Target="terms"},
    @{Source="VCFirmPage.jsx"; Target="vc-firm"},
    @{Source="VCMeeting.jsx"; Target="vc-meeting"},
    @{Source="MLPDevelopment.jsx"; Target="mlp-development"},
    @{Source="BetaTesting.jsx"; Target="beta-testing"},
    @{Source="BetaDevelopment.jsx"; Target="beta-development"},
    @{Source="MentorDemo.jsx"; Target="mentor-demo"},
    @{Source="Financials.jsx"; Target="financials"},
    @{Source="LeadershipChallenge.jsx"; Target="leadership-challenge"},
    @{Source="CompetitorChallenge.jsx"; Target="competitor-challenge"},
    @{Source="PressureChallenge.jsx"; Target="pressure-challenge"},
    @{Source="MVPBuilder.jsx"; Target="mvp-builder"},
    @{Source="RevenueModeling.jsx"; Target="revenue-modeling"},
    @{Source="MLPDevelopmentCenter.jsx"; Target="mlp-development-center"},
    @{Source="MLPLandingPage.jsx"; Target="mlp-landing-page"},
    @{Source="PromotionCenter.jsx"; Target="promotion-center"}
)

foreach ($mapping in $pageMappings) {
    $source = "src/pages/$($mapping.Source)"
    $targetDir = "app/$($mapping.Target)"
    $targetFile = "$targetDir/page.jsx"
    
    if (Test-Path $source) {
        New-Item -Path $targetDir -ItemType Directory -Force | Out-Null
        Copy-Item $source $targetFile
        Write-Host "  Created $targetFile" -ForegroundColor Green
    } else {
        Write-Host "  Skipped $source (not found)" -ForegroundColor Yellow
    }
}

# Step 5: Copy ClientLayout
Write-Host "`nCreating ClientLayout..." -ForegroundColor Yellow
if (Test-Path "src/pages/Layout.jsx") {
    Copy-Item "src/pages/Layout.jsx" "app/ClientLayout.jsx"
    Write-Host "  Created app/ClientLayout.jsx" -ForegroundColor Green
}

# Step 6: Copy other directories
Write-Host "`nCopying components, hooks, lib, utils, api..." -ForegroundColor Yellow
if (Test-Path "src/components") { Copy-Item -Path "src/components" -Destination "." -Recurse -Force }
if (Test-Path "src/hooks") { Copy-Item -Path "src/hooks" -Destination "." -Recurse -Force }
if (Test-Path "src/lib") { Copy-Item -Path "src/lib" -Destination "." -Recurse -Force }
if (Test-Path "src/utils") { Copy-Item -Path "src/utils" -Destination "." -Recurse -Force }
if (Test-Path "src/api") { Copy-Item -Path "src/api" -Destination "." -Recurse -Force }

# Step 7: Move styles
Write-Host "`nMoving styles..." -ForegroundColor Yellow
if (Test-Path "src/index.css") {
    Copy-Item "src/index.css" "app/globals.css"
    Write-Host "  Created app/globals.css" -ForegroundColor Green
}

Write-Host "`nMigration Complete!" -ForegroundColor Green
Write-Host "`nNext Steps:" -ForegroundColor Cyan
Write-Host "1. Fix imports in app/ClientLayout.jsx" -ForegroundColor White
Write-Host "2. Add 'use client' to pages that use hooks" -ForegroundColor White
Write-Host "3. Test: npm run dev" -ForegroundColor White