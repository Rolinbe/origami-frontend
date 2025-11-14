## Architecture : Système de Pointage par Badge QR
# UNE SEULE APPLICATION (Tablette/Mobile à l'entrée)

Scanner de QR codes sur badges
Mode Entrée / Sortie
Affichage de confirmation (photo, nom, heure)
Interface simple et rapide Material UI

# APPLICATION WEB (Admin unique)

Gestion complète par une seule personne
Génération et impression des badges
Tableau de bord multi-services
Gestion des employés et stagiaires
Rapports et exports

# Structure Organisationnelle
Services de l'entreprise :

Community Management
Création Visuelle (Design)
Informatique (IT)
Gestion Relation Client (CRM/Support)
Administration

Types de personnel :

Employés permanents (CDI)
Stagiaires (durée limitée)
Administrateur (gestionnaire unique)


## Flux de Travail

### **1. Création d'un nouveau membre (Admin)**
1. Admin se connecte à l'app web
2. Ajoute un employé/stagiaire :
   - Informations personnelles
   - Service d'affectation
   - Type (employé/stagiaire)
   - Photo
   - Dates (début + fin si stagiaire)
3. Système génère automatiquement :
   - ID unique
   - QR code personnalisé
   - Badge PDF imprimable
4. Admin imprime le badge

### **2. Pointage quotidien**

**a) Entrée**
1. L’employé arrive avec son badge (QR).
2. Il scanne le QR code sur la tablette/telephone à l’entrée.
3. L’application affiche immédiatement :
   - Photo de l’employé
   - Nom + Service
   - Heure de pointage (horodatage exact)
   - Message visuel + sonore de confirmation
4. Les données sont enregistrées localement si le réseau est indisponible (mode hors‑ligne) et synchronisées automatiquement dès le retour de la connexion.
5. Anti‑double scan : si un nouveau scan intervient dans une courte fenêtre (configurable), il est ignoré avec un message d’info.

**b) Sortie**
1. Même processus de scan au départ.
2. Le système détecte automatiquement s’il s’agit d’une sortie (si la dernière action du jour était une entrée).
3. Calcul automatique de la durée de travail du jour (entre dernière entrée et cette sortie).
4. Affichage d’un récapitulatif rapide (heure de sortie + durée travaillée).
5. Gestion des cas particuliers :
   - Si aucune entrée n’existe, un message d’erreur guidé est affiché.
   - Si une entrée précédente n’a pas été synchronisée, la synchronisation est tentée avant le calcul.

---

## Fonctionnalités de l'Application Web (Admin)

### **1. Tableau de bord principal**
- Vue d'ensemble en temps réel
- Présents actuellement (par service)
- Absents du jour
- Retardataires
- Stagiaires en cours
- Graphiques de présence

### **2. Gestion du personnel**

**a) Employés permanents**
- Liste complète avec filtres (service, statut)
- Ajout/Modification/Désactivation
- Génération de badge
- Historique de pointage individuel
- Statistiques personnelles

**b) Stagiaires**
- Liste des stagiaires actifs/terminés
- Dates de début et fin de stage
- Service d'affectation
- Suivi de présence
- Alertes de fin de stage

### **3. Gestion des services**
- Vue par service :
  - Community Management
  - Création Visuelle
  - Informatique
  - Gestion Relation Client
  - Administration
- Statistiques par service
- Effectif par service
- Taux de présence par service

### **4. Gestion des badges**
- Génération de badges individuels
- Génération en masse (import CSV)
- Réimpression de badges
- Révocation de badges (employé parti)
- Templates de badges personnalisables

### **5. Rapports et exports**
- Rapport journalier (PDF/Excel)
- Rapport mensuel par service
- Rapport individuel
- Heures travaillées
- Statistiques de retards
- Export pour paie

### **6. Configuration**
- Horaires de travail (8h00 par défaut)
- Paramètres des badges
- Gestion des jours fériés
- Paramètres de l'admin
