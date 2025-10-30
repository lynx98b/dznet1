<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Sommaire des Jeux - DZNet</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }
        
        body {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: #333;
            min-height: 100vh;
            padding: 20px;
        }
        
        .container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            border-radius: 15px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
            overflow: hidden;
        }
        
        header {
            background: linear-gradient(135deg, #2c3e50 0%, #3498db 100%);
            color: white;
            padding: 30px;
            text-align: center;
        }
        
        h1 {
            font-size: 2.5rem;
            margin-bottom: 10px;
        }
        
        .subtitle {
            font-size: 1.2rem;
            opacity: 0.9;
        }
        
        .games-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
            gap: 25px;
            padding: 30px;
        }
        
        .game-card {
            background: white;
            border-radius: 10px;
            overflow: hidden;
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
            transition: all 0.3s ease;
            border: 1px solid #e1e8ed;
        }
        
        .game-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 15px 30px rgba(0, 0, 0, 0.15);
        }
        
        .game-icon {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            height: 120px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 3rem;
        }
        
        .game-content {
            padding: 20px;
        }
        
        .game-title {
            font-size: 1.3rem;
            font-weight: 600;
            margin-bottom: 10px;
            color: #2c3e50;
        }
        
        .game-description {
            color: #666;
            margin-bottom: 15px;
            line-height: 1.5;
        }
        
        .game-link {
            display: inline-block;
            background: #3498db;
            color: white;
            padding: 8px 16px;
            border-radius: 5px;
            text-decoration: none;
            font-weight: 500;
            transition: background 0.3s ease;
        }
        
        .game-link:hover {
            background: #2980b9;
        }
        
        .file-name {
            font-size: 0.9rem;
            color: #999;
            margin-top: 10px;
            font-family: monospace;
        }
        
        .empty-state {
            text-align: center;
            padding: 60px 20px;
            color: #666;
        }
        
        .empty-state h2 {
            margin-bottom: 15px;
            color: #2c3e50;
        }
        
        @media (max-width: 768px) {
            .games-grid {
                grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
                padding: 20px;
            }
            
            h1 {
                font-size: 2rem;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <header>
            <h1>🎮 Jeux de Culture Générale</h1>
            <p class="subtitle">Découvrez tous nos jeux éducatifs et testez vos connaissances</p>
        </header>
        
        <div class="games-grid">
            <?php
            // Configuration
            $gamesFolder = '.'; // Dossier actuel
            $excludedFiles = ['index.php', 'sommaire.html']; // Fichiers à exclure
            
            // Fonction pour extraire le titre d'un fichier HTML
            function extractTitleFromFile($filename) {
                $content = file_get_contents($filename);
                if (preg_match('/<title>(.*?)<\/title>/i', $content, $matches)) {
                    return htmlspecialchars(trim($matches[1]));
                }
                // Si pas de titre, utiliser le nom de fichier
                return ucfirst(str_replace(['_', '-', '.html'], ' ', $filename));
            }
            
            // Fonction pour extraire la description
            function extractDescription($filename) {
                $content = file_get_contents($filename);
                
                // Chercher meta description
                if (preg_match('/<meta name="description" content="(.*?)"/i', $content, $matches)) {
                    return htmlspecialchars(trim($matches[1]));
                }
                
                // Chercher le premier paragraphe
                if (preg_match('/<p>(.*?)<\/p>/i', $content, $matches)) {
                    $text = strip_tags($matches[1]);
                    if (strlen($text) > 120) {
                        return substr($text, 0, 120) . '...';
                    }
                    return $text;
                }
                
                return "Testez vos connaissances avec ce jeu de culture générale.";
            }
            
            // Lire les fichiers HTML du dossier
            $htmlFiles = glob("*.html");
            $games = [];
            
            foreach ($htmlFiles as $file) {
                if (in_array($file, $excludedFiles)) continue;
                
                $games[] = [
                    'filename' => $file,
                    'title' => extractTitleFromFile($file),
                    'description' => extractDescription($file),
                    'url' => $file
                ];
            }
            
            // Trier par nom de fichier
            usort($games, function($a, $b) {
                return strnatcasecmp($a['filename'], $b['filename']);
            });
            
            // Afficher les jeux
            if (empty($games)) {
                echo '<div class="empty-state"><h2>Aucun jeu trouvé</h2><p>Aucun fichier HTML trouvé dans le dossier.</p></div>';
            } else {
                foreach ($games as $game) {
                    echo '
                    <div class="game-card">
                        <div class="game-icon">🎯</div>
                        <div class="game-content">
                            <h3 class="game-title">' . $game['title'] . '</h3>
                            <p class="game-description">' . $game['description'] . '</p>
                            <a href="' . $game['url'] . '" class="game-link">Jouer maintenant</a>
                            <div class="file-name">' . $game['filename'] . '</div>
                        </div>
                    </div>';
                }
            }
            ?>
        </div>
    </div>
</body>
</html>
