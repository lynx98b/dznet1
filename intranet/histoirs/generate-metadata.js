const fs = require('fs');
const path = require('path');

// Fichiers à exclure
const EXCLUDED_FILES = ['index.html', 'sommaire.html', 'histoires.html', '404.html'];
const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];

// Fonction pour extraire les métadonnées d'un fichier HTML
function extractMetadata(filePath) {
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        const filename = path.basename(filePath);
        
        // Extraire le titre
        const titleMatch = content.match(/<title>(.*?)<\/title>/i);
        const title = titleMatch ? titleMatch[1] : 
            filename.replace('.html', '')
                   .replace(/[-_]/g, ' ')
                   .replace(/([a-z])([A-Z])/g, '$1 $2')
                   .replace(/\b\w/g, l => l.toUpperCase());

        // Extraire la description
        const descMatch = content.match(/<meta name="description" content="(.*?)"/i);
        let description = descMatch ? descMatch[1] : '';

        if (!description) {
            const firstPMatch = content.match(/<p[^>]*>(.*?)<\/p>/i);
            description = firstPMatch ? 
                firstPMatch[1].substring(0, 120).replace(/<[^>]*>/g, '') + '...' : 
                'Histoire pour enfants';
        }

        // Extraire les métadonnées personnalisées
        const ageMatch = content.match(/<meta name="age" content="(.*?)"/i);
        const categorieMatch = content.match(/<meta name="categorie" content="(.*?)"/i);
        const typeMatch = content.match(/<meta name="type" content="(.*?)"/i);

        const age = ageMatch ? ageMatch[1] : '3-5';
        const categorie = categorieMatch ? categorieMatch[1] : 'contes';
        const type = typeMatch ? typeMatch[1] : 'histoire';

        // Chercher une image associée
        const baseName = filename.replace('.html', '');
        let logoUrl = null;

        for (const ext of IMAGE_EXTENSIONS) {
            const imagePath = path.join(path.dirname(filePath), baseName + ext);
            if (fs.existsSync(imagePath)) {
                logoUrl = baseName + ext;
                break;
            }
        }

        return {
            filename,
            title,
            description,
            url: filename,
            logoUrl,
            age,
            categorie,
            type,
            lastModified: fs.statSync(filePath).mtime
        };
    } catch (error) {
        console.error(`Erreur avec ${filePath}:`, error);
        return null;
    }
}

// Fonction principale
function generateMetadata() {
    const stories = [];
    
    // Lire tous les fichiers HTML du répertoire courant
    const files = fs.readdirSync('.');
    
    files.forEach(file => {
        if (file.endsWith('.html') && !EXCLUDED_FILES.includes(file)) {
            const metadata = extractMetadata(file);
            if (metadata) {
                stories.push(metadata);
            }
        }
    });
    
    // Trier par nom de fichier
    stories.sort((a, b) => a.filename.localeCompare(b.filename));
    
    // Générer le fichier JSON
    const output = {
        generatedAt: new Date().toISOString(),
        totalStories: stories.length,
        stories: stories
    };
    
    fs.writeFileSync('stories-metadata.json', JSON.stringify(output, null, 2));
    console.log(`✅ Métadonnées générées pour ${stories.length} histoires`);
}

generateMetadata();
