import { execFileSync, spawnSync } from "node:child_process";
import { existsSync, mkdirSync, rmSync } from "node:fs";
import { basename, join } from "node:path";
import { tmpdir } from "node:os";

const zipPath =
  process.argv[2] ||
  "/Users/biancaviciu/FCOS Dropbox/Bianca Viciu/VIDEOS SEPT 2026/HILEX ESSENTIAL VIDEOS.zip";

const requiredEnv = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "SUPABASE_SERVICE_ROLE_KEY",
  "CLOUDFLARE_ACCOUNT_ID",
  "CLOUDFLARE_STREAM_TOKEN"
];

const missing = requiredEnv.filter((name) => !process.env[name]);
if (missing.length) {
  console.error(`Missing required environment variables: ${missing.join(", ")}`);
  process.exit(1);
}

if (!existsSync(zipPath)) {
  console.error(`Zip file not found: ${zipPath}`);
  process.exit(1);
}

const materials = [
  {
    fileName: "Content Edited.mp4",
    title: "Vocea și imaginea ta după plecarea din companie: ce poate folosi angajatorul?",
    slug: "vocea-si-imaginea-ta-dupa-plecarea-din-companie",
    categorySlug: "drept-civil",
    excerpt: "Ce poate folosi fostul angajator după plecarea ta și când ai motive să ceri eliminarea conținutului."
  },
  {
    fileName: "EXTRADARE.MOV",
    title: "Extrădarea din UK: cum funcționează și când poate fi contestată",
    slug: "extradarea-din-uk",
    categorySlug: "drept-penal",
    excerpt: "Pașii principali într-o procedură de extrădare și situațiile în care aceasta poate fi contestată."
  },
  {
    fileName: "separare legala RO.mp4",
    title: "Separarea legală în Anglia și Țara Galilor: alternativa la divorț",
    slug: "separarea-legala-in-anglia-si-tara-galilor",
    categorySlug: "dreptul-familiei",
    excerpt: "Ce înseamnă separarea legală și când poate fi o alternativă la divorț."
  },
  {
    fileName: "Statut imigratie divort uk .mp4",
    title: "Divorțul în UK: ce se întâmplă cu statutul tău de imigrație?",
    slug: "divortul-in-uk-statut-imigratie",
    categorySlug: "imigratie",
    excerpt: "Cum poate afecta divorțul statutul de imigrație și de ce este important să verifici opțiunile din timp."
  },
  {
    fileName: "Materiale AI 2.mp4",
    title: "Deepfake: ce se întâmplă când AI creează materiale false cu tine?",
    slug: "deepfake-materiale-false-cu-tine",
    categorySlug: "drept-penal",
    excerpt: "Ce riscuri apar când AI creează materiale false cu imaginea sau vocea ta."
  },
  {
    fileName: "benefcii.mp4",
    title: "Beneficiile sociale în UK: cum eviți riscul unei investigații pentru fraudă",
    slug: "beneficiile-sociale-in-uk-investigatie-frauda",
    categorySlug: "drept-penal",
    excerpt: "Cum pot apărea suspiciunile de fraudă în zona beneficiilor sociale și ce trebuie verificat."
  },
  {
    fileName: "POCA RO.mp4",
    title: "Proceeds of Crime Act: confiscarea banilor și bunurilor provenite din infracțiuni",
    slug: "proceeds-of-crime-act-confiscarea-banilor",
    categorySlug: "drept-penal",
    excerpt: "Ce poate însemna o procedură POCA și cum sunt analizate fondurile sau bunurile suspectate."
  },
  {
    fileName: "Clandestini.MOV",
    title: "Migranți clandestini în vehicule: amenzi și contestarea lor în UK",
    slug: "migranti-clandestini-in-vehicule-amenzi-uk",
    categorySlug: "drept-penal",
    excerpt: "Ce riscuri apar când sunt găsiți migranți clandestini într-un vehicul și cum pot fi contestate amenzile."
  }
];

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL.replace(/\/$/, "");
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

async function supabaseFetch(path, options = {}) {
  const response = await fetch(`${supabaseUrl}/rest/v1/${path}`, {
    ...options,
    headers: {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
      ...(options.headers || {})
    }
  });

  if (!response.ok) {
    throw new Error(`Supabase error ${response.status}: ${await response.text()}`);
  }

  return response.status === 204 ? null : response.json();
}

async function createCloudflareUpload() {
  const response = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${process.env.CLOUDFLARE_ACCOUNT_ID}/stream/direct_upload`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.CLOUDFLARE_STREAM_TOKEN}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        maxDurationSeconds: 7200,
        requireSignedURLs: false
      })
    }
  );
  const payload = await response.json();

  if (!response.ok || !payload?.result?.uploadURL || !payload?.result?.uid) {
    throw new Error(`Cloudflare upload URL error: ${JSON.stringify(payload)}`);
  }

  return {
    uploadUrl: payload.result.uploadURL,
    videoId: payload.result.uid
  };
}

function uploadFile(uploadUrl, filePath) {
  const result = spawnSync("curl", ["--fail", "--silent", "--show-error", "-X", "POST", "-F", `file=@${filePath}`, uploadUrl], {
    encoding: "utf8"
  });

  if (result.status !== 0) {
    throw new Error(`Video upload failed for ${basename(filePath)}: ${result.stderr || result.stdout}`);
  }
}

function extractZip(destination) {
  rmSync(destination, { recursive: true, force: true });
  mkdirSync(destination, { recursive: true });
  execFileSync("unzip", ["-q", "-j", zipPath, "HILEX ESSENTIAL VIDEOS/*", "-d", destination]);
}

function filePathFor(destination, fileName) {
  const path = join(destination, fileName);
  if (!existsSync(path)) {
    throw new Error(`Expected video file missing after extraction: ${fileName}`);
  }
  return path;
}

async function main() {
  const destination = join(tmpdir(), `hilex-essential-videos-${Date.now()}`);
  extractZip(destination);

  const categories = await supabaseFetch("categories?select=id,slug");
  const categoryBySlug = new Map(categories.map((category) => [category.slug, category.id]));

  for (const material of materials) {
    const categoryId = categoryBySlug.get(material.categorySlug);
    if (!categoryId) {
      throw new Error(`Category not found in Supabase: ${material.categorySlug}`);
    }

    const existing = await supabaseFetch(`lessons?slug=eq.${encodeURIComponent(material.slug)}&select=id,video_asset_id`);
    if (existing.length) {
      console.log(`Skipping existing material: ${material.title}`);
      continue;
    }

    const filePath = filePathFor(destination, material.fileName);
    console.log(`Creating Cloudflare upload for: ${material.fileName}`);
    const { uploadUrl, videoId } = await createCloudflareUpload();

    console.log(`Uploading video: ${material.fileName}`);
    uploadFile(uploadUrl, filePath);

    console.log(`Creating Essential lesson: ${material.title}`);
    await supabaseFetch("lessons", {
      method: "POST",
      body: JSON.stringify({
        category_id: categoryId,
        title: material.title,
        slug: material.slug,
        excerpt: material.excerpt,
        body: [],
        key_points: [],
        extra_info: [],
        access_level: "basic",
        status: "published",
        video_provider: "cloudflare_stream",
        video_asset_id: videoId,
        video_playback_id: videoId,
        platform: "essential",
        published_at: new Date().toISOString()
      })
    });

    console.log(`Done: ${material.title}`);
  }

  rmSync(destination, { recursive: true, force: true });
  console.log("All Essential videos imported.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
