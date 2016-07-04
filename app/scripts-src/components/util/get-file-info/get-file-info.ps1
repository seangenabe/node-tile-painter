$getFileInfoDefinition = Get-Content './GetFileInfo.cs'
$shell32 = Add-Type -MemberDefinition $getFileInfoDefinition -Name 'Shell32' -PassThru -Namespace 'Win32'
