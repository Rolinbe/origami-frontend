#!/bin/bash

echo "🔍 Script de diagnostic pour admin.origami.mg"
echo "=============================================="
echo ""

# Couleurs
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# 1. Vérifier le répertoire
echo -e "${BLUE}📁 1. Vérification du répertoire${NC}"
cd /home/lucas/projets/origami_org/frontend/app
echo "Répertoire actuel: $(pwd)"
echo ""
echo "Fichiers présents:"
ls -lah
echo ""

# 2. Vérifier les fichiers essentiels
echo -e "${BLUE}📄 2. Vérification des fichiers essentiels${NC}"
for file in "Dockerfile" "docker-compose.yml" "package.json" "nginx.conf"; do
    if [ -f "$file" ]; then
        echo -e "${GREEN}✅ $file existe${NC}"
    else
        echo -e "${RED}❌ $file manquant${NC}"
    fi
done
echo ""

# 3. Afficher le docker-compose.yml
echo -e "${BLUE}📋 3. Contenu du docker-compose.yml${NC}"
cat docker-compose.yml
echo ""

# 4. Afficher le Dockerfile
echo -e "${BLUE}📋 4. Contenu du Dockerfile${NC}"
cat Dockerfile
echo ""

# 5. Vérifier le réseau
echo -e "${BLUE}🌐 5. Vérification du réseau Docker${NC}"
if docker network inspect nginx_proxy_network &>/dev/null; then
    echo -e "${GREEN}✅ Réseau nginx_proxy_network existe${NC}"
    echo "Conteneurs connectés:"
    docker network inspect nginx_proxy_network | grep -A 5 "Containers"
else
    echo -e "${RED}❌ Réseau nginx_proxy_network n'existe pas${NC}"
fi
echo ""

# 6. Vérifier les conteneurs existants
echo -e "${BLUE}🐳 6. Conteneurs admin_origami existants${NC}"
docker ps -a | grep admin_origami || echo "Aucun conteneur trouvé"
echo ""

# 7. Vérifier les images
echo -e "${BLUE}🖼️  7. Images admin_origami existantes${NC}"
docker images | grep admin_origami || echo "Aucune image trouvée"
echo ""

# 8. Nettoyer et essayer de builder
echo -e "${YELLOW}🧹 8. Nettoyage et tentative de build${NC}"
docker compose down 2>/dev/null || true
echo "Conteneurs arrêtés"
echo ""

echo -e "${YELLOW}🏗️  Tentative de build...${NC}"
if docker compose build --no-cache 2>&1 | tee /tmp/build.log; then
    echo -e "${GREEN}✅ Build réussi !${NC}"
    
    echo ""
    echo -e "${YELLOW}🚀 Tentative de démarrage...${NC}"
    if docker compose up -d; then
        echo -e "${GREEN}✅ Conteneur démarré !${NC}"
        sleep 5
        echo ""
        echo "📊 Statut:"
        docker ps | grep admin_origami
        echo ""
        echo "📋 Logs:"
        docker logs admin_origami_web --tail 20
    else
        echo -e "${RED}❌ Échec du démarrage${NC}"
        docker compose logs
    fi
else
    echo -e "${RED}❌ Échec du build${NC}"
    echo ""
    echo -e "${RED}📋 Erreurs de build:${NC}"
    cat /tmp/build.log | tail -50
fi

echo ""
echo "=============================================="
echo "🔍 Diagnostic terminé"