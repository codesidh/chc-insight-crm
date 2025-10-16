# Fix TypeScript path aliases in compiled backend JavaScript
# Comprehensive fix for all import path issues

param(
    [string]$BackendDir = "backend"
)

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ProjectRoot = Split-Path -Parent (Split-Path -Parent $ScriptDir)
$BackendPath = Join-Path $ProjectRoot $BackendDir
$DistPath = Join-Path $BackendPath "dist"

Write-Host "Project Root: $ProjectRoot" -ForegroundColor Yellow
Write-Host "Backend Path: $BackendPath" -ForegroundColor Yellow
Write-Host "Dist Path: $DistPath" -ForegroundColor Yellow

Write-Host "Fixing TypeScript path aliases in backend..." -ForegroundColor Cyan

if (-not (Test-Path $DistPath)) {
    Write-Host "Backend dist folder not found. Please build the backend first." -ForegroundColor Red
    exit 1
}

# Get all JavaScript files in dist
$jsFiles = Get-ChildItem -Recurse -Path $DistPath -Filter "*.js"

$totalFiles = $jsFiles.Count
$fixedFiles = 0

foreach ($file in $jsFiles) {
    $content = Get-Content $file.FullName -Raw
    $originalContent = $content
    
    # 1. Replace @/ imports with relative paths
    $content = $content -replace 'require\("@/([^"]+)"\)', 'require("./$1")'
    $content = $content -replace "require\('@/([^']+)'\)", "require('./$1')"
    
    # 2. Fix config directory imports (same directory references)
    if ($file.DirectoryName -like "*\config") {
        $content = $content -replace 'require\("\.\.\/environment"\)', 'require("./environment")'
        $content = $content -replace "require\('\.\.\/environment'\)", "require('./environment')"
        $content = $content -replace 'require\("\.\.\/knexfile"\)', 'require("./knexfile")'
        $content = $content -replace "require\('\.\.\/knexfile'\)", "require('./knexfile')"
    }
    
    # 3. Fix types directory imports (same directory references)
    if ($file.DirectoryName -like "*\types") {
        $content = $content -replace 'require\("\.\.\/validation-schemas"\)', 'require("./validation-schemas")'
        $content = $content -replace "require\('\.\.\/validation-schemas'\)", "require('./validation-schemas')"
        $content = $content -replace 'require\("\.\.\/index"\)', 'require("./index")'
        $content = $content -replace "require\('\.\.\/index'\)", "require('./index')"
    }
    
    # 4. Fix services directory imports (correct relative paths)
    if ($file.DirectoryName -like "*\services") {
        # Fix imports to other services (same directory)
        $content = $content -replace 'require\("\.\.\/([^/]+\.service)"\)', 'require("./$1")'
        $content = $content -replace "require\('\.\.\/([^/]+\.service)'\)", "require('./$1')"
        
        # Fix imports to config (up one level)
        $content = $content -replace 'require\("\.\.\/config/([^"]+)"\)', 'require("../config/$1")'
        $content = $content -replace "require\('\.\.\/config/([^']+)'\)", "require('../config/$1')"
        
        # Fix imports to types (up one level)
        $content = $content -replace 'require\("\.\.\/types"\)', 'require("../types")'
        $content = $content -replace "require\('\.\.\/types'\)", "require('../types')"
        $content = $content -replace 'require\("\.\.\/types/([^"]+)"\)', 'require("../types/$1")'
        $content = $content -replace "require\('\.\.\/types/([^']+)'\)", "require('../types/$1')"
    }
    
    # 5. Fix routes directory imports (correct relative paths)
    if ($file.DirectoryName -like "*\routes") {
        # Fix imports to controllers (up one level)
        $content = $content -replace 'require\("\.\.\/controllers/([^"]+)"\)', 'require("../controllers/$1")'
        $content = $content -replace "require\('\.\.\/controllers/([^']+)'\)", "require('../controllers/$1')"
        
        # Fix imports to services (up one level)
        $content = $content -replace 'require\("\.\.\/services/([^"]+)"\)', 'require("../services/$1")'
        $content = $content -replace "require\('\.\.\/services/([^']+)'\)", "require('../services/$1')"
        
        # Fix imports to middleware (up one level)
        $content = $content -replace 'require\("\.\.\/middleware/([^"]+)"\)', 'require("../middleware/$1")'
        $content = $content -replace "require\('\.\.\/middleware/([^']+)'\)", "require('../middleware/$1')"
    }
    
    # 6. Fix controllers directory imports (correct relative paths)
    if ($file.DirectoryName -like "*\controllers") {
        # Fix imports to services (up one level)
        $content = $content -replace 'require\("\.\.\/services/([^"]+)"\)', 'require("../services/$1")'
        $content = $content -replace "require\('\.\.\/services/([^']+)'\)", "require('../services/$1')"
        
        # Fix imports to types (up one level)
        $content = $content -replace 'require\("\.\.\/types/([^"]+)"\)', 'require("../types/$1")'
        $content = $content -replace "require\('\.\.\/types/([^']+)'\)", "require('../types/$1')"
    }
    
    # 7. Fix middleware directory imports (correct relative paths)
    if ($file.DirectoryName -like "*\middleware") {
        # Fix imports to services (up one level)
        $content = $content -replace 'require\("\.\.\/services/([^"]+)"\)', 'require("../services/$1")'
        $content = $content -replace "require\('\.\.\/services/([^']+)'\)", "require('../services/$1')"
        
        # Fix imports to other middleware (same directory)
        $content = $content -replace 'require\("\.\.\/([^/]+\.middleware)"\)', 'require("./$1")'
        $content = $content -replace "require\('\.\.\/([^/]+\.middleware)'\)", "require('./$1')"
    }
    
    # 8. Fix scripts directory imports (correct relative paths)
    if ($file.DirectoryName -like "*\scripts") {
        # Fix imports to services (up one level)
        $content = $content -replace 'require\("\.\.\/services/([^"]+)"\)', 'require("../services/$1")'
        $content = $content -replace "require\('\.\.\/services/([^']+)'\)", "require('../services/$1')"
        
        # Fix imports to config (up one level)
        $content = $content -replace 'require\("\.\.\/config/([^"]+)"\)', 'require("../config/$1")'
        $content = $content -replace "require\('\.\.\/config/([^']+)'\)", "require('../config/$1')"
    }
    
    if ($content -ne $originalContent) {
        Set-Content -Path $file.FullName -Value $content -NoNewline
        $fixedFiles++
        Write-Host "Fixed: $($file.Name)" -ForegroundColor Green
    }
}

Write-Host "`nPath alias fix complete!" -ForegroundColor Green
Write-Host "Files processed: $totalFiles" -ForegroundColor Yellow
Write-Host "Files fixed: $fixedFiles" -ForegroundColor Yellow