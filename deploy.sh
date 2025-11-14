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

# Vérifier si le réseau existe, sinon le créer
echo -e "${YELLOW}🔍 Vérification du réseau nginx_proxy_network...${NC}"
if ! docker network inspect nginx_proxy_network &>/dev/null; then
    echo -e "${YELLOW}⚠️  Réseau nginx_proxy_network non trouvé, création...${NC}"
    docker network create nginx_proxy_network
    echo -e "${GREEN}✅ Réseau créé${NC}"
    
    # Connecter le reverse proxy au réseau
    if docker ps --filter "name=nginx_reverse_proxy" | grep -q nginx_reverse_proxy; then
        echo -e "${YELLOW}🔗 Connexion du reverse proxy au réseau...${NC}"
        docker network connect nginx_proxy_network nginx_reverse_proxy 2>/dev/null || echo "Déjà connecté"
    fi
else
    echo -e "${GREEN}✅ Réseau nginx_proxy_network existe${NC}"
fi

# Arrêter et supprimer l'ancien conteneur
echo -e "${YELLOW}🛑 Arrêt de l'ancien conteneur admin_origami_web...${NC}"
docker compose down 2>/dev/null || true

# Nettoyer les images non utilisées
echo -e "${YELLOW}🧹 Nettoyage des anciennes images...${NC}"
docker image prune -f

# Rebuild et démarrer le nouveau conteneur
echo -e "${YELLOW}🏗️  Construction de la nouvelle image...${NC}"
if ! docker compose build --no-cache; then
    echo -e "${RED}❌ Erreur lors de la construction de l'image${NC}"
    exit 1
fi

echo -e "${YELLOW}🚀 Démarrage du conteneur admin_origami_web...${NC}"
if ! docker compose up -d; then
    echo -e "${RED}❌ Erreur lors du démarrage du conteneur${NC}"
    echo -e "${RED}📋 Logs:${NC}"
    docker compose logs
    exit 1
fi

# Attendre que le conteneur démarre
echo -e "${YELLOW}⏳ Attente du démarrage du conteneur (10s)...${NC}"
sleep 10

# Vérifier que le conteneur est bien démarré
if docker ps | grep -q admin_origami_web; then
    echo -e "${GREEN}✅ Conteneur admin_origami_web démarré avec succès${NC}"
    echo ""
    echo -e "${BLUE}📊 Statut du conteneur:${NC}"
    docker ps --filter "name=admin_origami_web" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
    echo ""
    echo -e "${BLUE}📋 Dernières lignes des logs:${NC}"
    docker logs admin_origami_web --tail 10
    echo ""
    echo -e "${GREEN}🌐 Application accessible sur:${NC}"
    echo -e "   - Local: http://localhost:8085"
    echo -e "   - Web: http://admin.origami.mg"
else
    echo -e "${RED}❌ Erreur: Le conteneur n'a pas pu démarrer${NC}"
    echo -e "${RED}📋 Logs du conteneur:${NC}"
    docker logs admin_origami_web --tail 50 2>&1 || echo "Pas de logs disponibles"
    echo ""
    echo -e "${RED}📋 Logs de compose:${NC}"
    docker compose logs
    exit 1
fi

# Vérifier la connexion au réseau du reverse proxy
echo ""
echo -e "${BLUE}🔍 Vérification du réseau...${NC}"
if docker network inspect nginx_proxy_network &>/dev/null; then
    echo -e "${GREEN}✅ Réseau nginx_proxy_network configuré${NC}"
    echo -e "${BLUE}📋 Conteneurs connectés au réseau:${NC}"
    docker network inspect nginx_proxy_network | grep -A 1 "Containers"
fi

echo ""
echo -e "${GREEN}╔════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║   ✅ Déploiement terminé avec succès  ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════╝${NC}"