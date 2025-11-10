## Architecture : Système de Pointage par Badge QR
# UNE SEULE APPLICATION (Tablette/Mobile à l'entrée)

Scanner de QR codes sur badges
Mode Entrée / Sortie
Affichage de confirmation (photo, nom, heure)
Fonctionne hors-ligne avec synchronisation
Interface simple et rapide

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
1. Employé arrive avec son badge
2. Scanne le QR code sur la tablette à l'entrée
3. L'app affiche :
   - Photo de l'employé
   - Nom + Service
   - Heure de pointage
   - Message de confirmation
4. Données enregistrées (même hors-ligne)

### **3. Sortie**
1. Même processus au départ
2. Le système détecte automatiquement si c'est une entrée ou sortie
3. Calcule la durée de travail

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
