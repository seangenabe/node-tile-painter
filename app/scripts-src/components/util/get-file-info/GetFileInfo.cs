/* this is an invalid C# file */

[StructLayout(LayoutKind.Sequential)]
public struct SHFILEINFO {
  IntPtr hIcon;
  int iIcon;
  uint dwAttributes;
  string szDisplayName;
  string szTypeName
}

[DllImport("shell32.dll")]
public static extern IntPtr SHGetFileInfo(
  string pszPath,
  uint dwFileAttributes,
  ref SHFILEINFO psfi,
  uint cbSizeFileInfo,
  uint uFlags
);
