#!/bin/bash

echo "🚀 Démarrage du déploiement de admin.origami.mg..."

# Couleurs pour les logs
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Aller dans le dossier de l'application
cd /home/lucas/projets/origami_org/frontend/app

echo -e "${BLUE}📁 Répertoire: $(pwd)${NC}"

# Arrêter et supprimer l'ancien conteneur
echo -e "${YELLOW}🛑 Arrêt de l'ancien conteneur admin_origami_web...${NC}"
docker compose down 2>/dev/null || true

# Nettoyer les images non utilisées
echo -e "${YELLOW}🧹 Nettoyage des anciennes images...${NC}"
docker image prune -f

# Rebuild et démarrer le nouveau conteneur
echo -e "${YELLOW}🏗️  Construction de la nouvelle image...${NC}"
docker compose build --no-cache

echo -e "${YELLOW}🚀 Démarrage du conteneur admin_origami_web...${NC}"
docker compose up -d

# Attendre que le conteneur démarre
echo -e "${YELLOW}⏳ Attente du démarrage du conteneur (5s)...${NC}"
sleep 5

# Vérifier que le conteneur est bien démarré
if docker ps | grep -q admin_origami_web; then
    echo -e "${GREEN}✅ Conteneur admin_origami_web démarré avec succès${NC}"
    echo ""
    echo -e "${BLUE}📊 Statut du conteneur:${NC}"
    docker ps --filter "name=admin_origami_web" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
    echo ""
    echo -e "${GREEN}🌐 Application accessible sur:${NC}"
    echo -e "   - Local: http://localhost:8085"
    echo -e "   - Web: http://admin.origami.mg"
else
    echo -e "${RED}❌ Erreur: Le conteneur n'a pas pu démarrer${NC}"
    echo -e "${RED}📋 Logs du conteneur:${NC}"
    docker logs admin_origami_web --tail 50 2>&1 || echo "Pas de logs disponibles"
    exit 1
fi

# Vérifier la connexion au réseau du reverse proxy
echo ""
echo -e "${BLUE}🔍 Vérification du réseau...${NC}"
if docker network inspect nginx_proxy_network &>/dev/null; then
    echo -e "${GREEN}✅ Connecté au réseau nginx_proxy_network${NC}"
else
    echo -e "${YELLOW}⚠️  Réseau nginx_proxy_network non trouvé${NC}"
fi

echo ""
echo -e "${GREEN}╔════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║   ✅ Déploiement terminé avec succès  ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════╝${NC}"