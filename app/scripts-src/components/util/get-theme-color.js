const pscommand = require('./pscommand')

module.exports = getThemeColor
async function getThemeColor() {
  let command = `
Add-Type @"
using System;
using System.Runtime.InteropServices;

namespace UxTheme {

  public class ColorMethods {

    [DllImport("uxtheme.dll", EntryPoint = "#95")]
    public static extern uint GetImmersiveColorFromColorSetEx(
      uint dwImmersiveColorSet,
      uint dwImmersiveColorType,
      bool bIgnoreHighContrast,
      uint dwHighContrastCacheMode
    );

    [DllImport("uxtheme.dll", EntryPoint = "#96")]
    public static extern uint GetImmersiveColorTypeFromName(IntPtr pName);

    [DllImport("uxtheme.dll", EntryPoint = "#98")]
    public static extern int GetImmersiveUserColorSetPreference(
      bool bForceCheckRegistry,
      bool bSkipCheckOnFail
    );

    [DllImport("uxtheme.dll", EntryPoint = "#100")]
    public static extern IntPtr GetImmersiveColorNamedTypeByIndex(uint dwIndex);

    public static byte[] GetStartSelectionBackground() {
      int colorset = GetImmersiveUserColorSetPreference(false, false);

      IntPtr name =
        Marshal.StringToHGlobalUni("ImmersiveStartSelectionBackground");
      uint type = GetImmersiveColorTypeFromName(name);

      uint word = GetImmersiveColorFromColorSetEx(
        (uint)colorset,
        type,
        false,
        0
      );
      byte[] arr = new byte[4];
      arr[0] = (byte)((0xff000000 & word) >> 24);
      arr[1] = (byte)((0xff0000 & word) >> 16);
      arr[2] = (byte)((0xff00 & word) >> 8);
      arr[3] = (byte)(0xff & word);
      return arr;
    }
  }
}
"@ -PassThru > $null
[UxTheme.ColorMethods]::GetStartSelectionBackground() | ConvertTo-Json -Compress
`
  let result = JSON.parse(await pscommand(command))
  console.log('result', require('util').inspect(result, { colors: true })) // DEBUG
  let [a, b, g, r] = result
  return { a, r, g, b }
}

if (require.main === module) {
  (async () => {
    try {
      process.stdout.write(JSON.stringify(await getThemeColor()))
    }
    catch (err) {
      console.error(err.stack)
    }
  })()
}
