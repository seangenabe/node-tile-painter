const pscommand = require('./pscommand')
const psencode = require('./psencode')

module.exports = async function getFileInfo(file) {
  let command = `
Add-Type @"
using System;
using System.Drawing;
using System.Drawing.Imaging;
using System.IO;
using System.Runtime.InteropServices;

namespace Shell32 {

  [StructLayout(LayoutKind.Sequential, CharSet = CharSet.Auto)]
  public struct SHFILEINFO {
    public IntPtr hIcon;
    public int iIcon;
    public uint dwAttributes;
    [MarshalAs(UnmanagedType.ByValTStr, SizeConst = 260)]
    public string szDisplayName;
    [MarshalAs(UnmanagedType.ByValTStr, SizeConst = 80)]
    public string szTypeName;
  }

  public class FileMethods {

    public const uint SHGFI_ICON = 0x100;
    public const uint SHGFI_LARGEICON = 0x0;
    public const uint SHGFI_SYSICONINDEX = 0x4000;
    public const uint ILD_NORMAL = 0x0;
    public const uint ILD_SCALE = 0x2000;

    [DllImport("shell32.dll", CharSet = CharSet.Auto)]
    public static extern IntPtr SHGetFileInfo(
      string pszPath,
      uint dwFileAttributes,
      out SHFILEINFO psfi,
      uint cbSizeFileInfo,
      uint uFlags
    );

    [DllImport("comctl32.dll", CharSet = CharSet.Auto)]
    public static extern IntPtr ImageList_GetIcon(
      IntPtr himl,
      int i,
      uint flags
    );

    public static byte[] GetFileInfo(string path) {
      SHFILEINFO fi = new SHFILEINFO();
      IntPtr listHandle = SHGetFileInfo(
        path,
        0,
        out fi,
        (uint)Marshal.SizeOf(fi),
        SHGFI_SYSICONINDEX
      );
      if (listHandle == IntPtr.Zero) { return null; }
      IntPtr iconHandle = ImageList_GetIcon(listHandle, fi.iIcon, ILD_NORMAL);
      Icon icon = Icon.FromHandle(iconHandle);
      Bitmap bmp = icon.ToBitmap();
      using (MemoryStream s = new MemoryStream()) {
        bmp.Save(s, ImageFormat.Png);
        return s.ToArray();
      }
    }
  }
}
"@ -PassThru -ReferencedAssemblies System.Drawing > $null
$fn = ${psencode(file)}
[Shell32.FileMethods]::GetFileInfo($fn) | ConvertTo-Json -Compress
`
  let result = JSON.parse(await pscommand(command))
  if (result == null) { return result }
  result = Buffer.from(result)
  return result
}
