# Fix all imports to use @/src/api instead of @/api
Write-Host "Fixing import paths..." -ForegroundColor Green

# Get all jsx and js files
$files = Get-ChildItem -Path "app" -Include *.jsx,*.js -Recurse

$count = 0
foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    $originalContent = $content
    
    # Replace @/api/entities with @/src/api/entities
    $content = $content -replace '@/api/entities', '@/src/api/entities'
    
    # Replace @/api/integrations with @/src/api/integrations
    $content = $content -replace '@/api/integrations', '@/src/api/integrations'
    
    # Only write if content changed
    if ($content -ne $originalContent) {
        Set-Content -Path $file.FullName -Value $content -NoNewline
        Write-Host "  Fixed: $($file.Name)" -ForegroundColor Yellow
        $count++
    }
}

Write-Host "`nFixed $count files!" -ForegroundColor Green
Write-Host "Now run: npm run dev" -ForegroundColor Cyan