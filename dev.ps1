$env:Path = "C:\Program Files\nodejs;" + $env:Path
Set-Location "C:\Users\Thurcos\Desktop\plantao"
& "C:\Program Files\nodejs\node.exe" "C:\Program Files\nodejs\node_modules\npm\bin\npm-cli.js" run dev
