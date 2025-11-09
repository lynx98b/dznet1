const fs = require('fs');
const path = require('path');

// Configuration
const EXCLUDED_FILES = ['index.html', 'sommaire.html', 'histoires.html', '404.html', 'generate-metadata.js'];
const EXCLUDED_DIRS = ['.git', 'node_modules', '.github'];
const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];

// Fonction récursive pour trouver tous les fichiers HTML
function findHTMLFiles(dir, fileList = []) {
    const files = fs.readdirSync(dir);
    
    files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        
        if (stat.isDirectory()) {
            if (!EXCLUDED_DIRS.includes(file)) {
                fileList = findHTMLFiles(filePath, fileList);
            }
        } else {
            if (file.endsWith('.html') && !EXCLUDED_FILES.includes(file)) {
                fileList.push({
                    fullPath: filePath,
                    relativePath: path.relative('.', filePath),
                    directory: dir
                });
            }
        }
    });
    
    return fileList;
}

// Fonction pour extraire les métadonnées
function extractMetadata(fileInfo) {
    try {
        const { fullPath, relativePath, directory } = fileInfo;
        const content = fs.readFileSync(fullPath, 'utf8');
        const filename = path.basename(relativePath);
        
        console.log(`📖 Traitement: ${relativePath}`);
        
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
            const imagePath = path.join(directory, baseName + ext);
            if (fs.existsSync(imagePath)) {
                logoUrl = path.relative('.', imagePath);
                console.log(`   🖼️  Image: ${logoUrl}`);
                break;
            }
        }

        const metadata = {
            filename: relativePath,
            title,
            description,
            url: relativePath,
            logoUrl,
            age,
            categorie,
            type,
            decouverte,
            directory: path.dirname(relativePath),
            lastModified: fs.statSync(fullPath).mtime
        };
        
        console.log(`   ✅ "${title}" (${age} ans, ${categorie})`);
        
        return metadata;
    } catch (error) {
        console.error(`❌ Erreur avec ${fileInfo.relativePath}:`, error.message);
        return null;
    }
}

// Fonction principale
function generateMetadata() {
    console.log('🚀 Début du scan récursif...\n');
    
    const htmlFiles = findHTMLFiles('.');
    console.log(`📁 ${htmlFiles.length} fichiers HTML trouvés\n`);
    
    const stories = [];
    
    htmlFiles.forEach(fileInfo => {
        const metadata = extractMetadata(fileInfo);
        if (metadata) {
            stories.push(metadata);
        }
    });
    
    stories.sort((a, b) => a.filename.localeCompare(b.filename));
    
    const output = {
        generatedAt: new Date().toISOString(),
        totalStories: stories.length,
        scanSummary: {
            totalFiles: htmlFiles.length,
            successful: stories.length,
            failed: htmlFiles.length - stories.length
        },
        stories: stories
    };
    
    fs.writeFileSync('stories-metadata.json', JSON.stringify(output, null, 2));
    
    console.log(`\n🎉 SCAN TERMINÉ !`);
    console.log(`✅ ${stories.length} histoires traitées`);
    console.log(`❌ ${htmlFiles.length - stories.length} échecs`);
    console.log(`📄 Fichier: stories-metadata.json`);
}

// Exécuter
if (require.main === module) {
    generateMetadata();
}

module.exports = { generateMetadata };
