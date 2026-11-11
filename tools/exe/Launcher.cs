// Ironvale portable launcher.
// The whole game is stored inside this exe. On start it unpacks itself into an "IronvaleData" folder next to the exe
// (or the user's local app data if that folder cannot be written) and opens the game in its own window,
// using the Edge or Chrome engine already on the PC. No internet connection and no installation are needed.
using System;
using System.Diagnostics;
using System.IO;
using System.IO.Compression;
using System.Reflection;
using System.Windows.Forms;

[assembly: AssemblyTitle("Ironvale")]
[assembly: AssemblyProduct("Ironvale")]
[assembly: AssemblyDescription("Ironvale - a 3D real-time strategy game")]
[assembly: AssemblyVersion("1.0.0.0")]
[assembly: AssemblyFileVersion("1.0.0.0")]

static class Launcher
{
    static string ReadText(string name)
    {
        using (Stream s = Assembly.GetExecutingAssembly().GetManifestResourceStream(name))
        using (StreamReader r = new StreamReader(s)) return r.ReadToEnd().Trim();
    }

    static bool CanWrite(string dir)
    {
        try
        {
            Directory.CreateDirectory(dir);
            string probe = Path.Combine(dir, "write.test");
            File.WriteAllText(probe, "ok"); File.Delete(probe);
            return true;
        }
        catch { return false; }
    }

    static string FindBrowser()
    {
        string[] roots = {
            Environment.GetEnvironmentVariable("ProgramFiles(x86)"), Environment.GetEnvironmentVariable("ProgramFiles"),
            Environment.GetEnvironmentVariable("LocalAppData") };
        string[] rel = { @"Microsoft\Edge\Application\msedge.exe", @"Google\Chrome\Application\chrome.exe", @"BraveSoftware\Brave-Browser\Application\brave.exe" };
        foreach (string r in rel)
            foreach (string root in roots)
            {
                if (string.IsNullOrEmpty(root)) continue;
                string p = Path.Combine(root, r);
                if (File.Exists(p)) return p;
            }
        return null;
    }

    [STAThread]
    static void Main()
    {
        try
        {
            string exeDir = Path.GetDirectoryName(Assembly.GetExecutingAssembly().Location);
            string data = Path.Combine(exeDir, "IronvaleData");
            if (!CanWrite(data))
                data = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData), "Ironvale");
            Directory.CreateDirectory(data);

            // unpack the game once per version
            string stamp = ReadText("stamp.txt");
            string game = Path.Combine(data, "game-" + stamp);
            string html = Path.Combine(game, "ironvale.html");
            if (!File.Exists(Path.Combine(game, "ready.txt")))
            {
                if (Directory.Exists(game)) Directory.Delete(game, true);
                Directory.CreateDirectory(game);
                using (Stream s = Assembly.GetExecutingAssembly().GetManifestResourceStream("game.zip"))
                using (ZipArchive zip = new ZipArchive(s, ZipArchiveMode.Read))
                    foreach (ZipArchiveEntry e in zip.Entries)
                    {
                        string target = Path.GetFullPath(Path.Combine(game, e.FullName));
                        if (!target.StartsWith(game, StringComparison.OrdinalIgnoreCase)) continue;
                        Directory.CreateDirectory(Path.GetDirectoryName(target));
                        e.ExtractToFile(target, true);
                    }
                File.WriteAllText(Path.Combine(game, "ready.txt"), stamp);
                // tidy away older unpacked versions
                foreach (string d in Directory.GetDirectories(data, "game-*"))
                    if (!string.Equals(d, game, StringComparison.OrdinalIgnoreCase)) { try { Directory.Delete(d, true); } catch { } }
            }

            string url = new Uri(html).AbsoluteUri;
            string browser = FindBrowser();
            if (browser == null)
            {
                // no Edge or Chrome found: open in whatever the default browser is
                Process.Start(new ProcessStartInfo(html) { UseShellExecute = true });
                return;
            }
            // its own profile keeps saved games and settings inside the portable folder
            string profile = Path.Combine(data, "profile");
            string args = "--app=\"" + url + "\" --user-data-dir=\"" + profile + "\" --no-first-run --no-default-browser-check --start-maximized"
                + " --autoplay-policy=no-user-gesture-required --disable-features=Translate,msEdgeSidebarV2 --disable-sync --disable-extensions --allow-file-access-from-files";
            Process.Start(new ProcessStartInfo(browser, args) { UseShellExecute = false });
        }
        catch (Exception ex)
        {
            MessageBox.Show("Ironvale could not start.\n\n" + ex.Message, "Ironvale", MessageBoxButtons.OK, MessageBoxIcon.Error);
        }
    }
}
