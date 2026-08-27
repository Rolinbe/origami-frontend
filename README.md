# Origami Web - Application de Pointage QR (Frontend)

Application web React + Vite + TypeScript + Tailwind CSS + shadcn/ui

## 🚀 Pages & Fonctionnalités

| Page | Route | Fonctionnalités |
|------|-------|----------------|
| **Connexion** | `/login` | Authentification JWT + refresh token |
| **Tableau de bord** | `/` | Stats en temps réel, graphiques, tendances |
| **Départements** | `/services` | Gestion CRUD des services |
| **Employés** | `/employees` | CRUD, import CSV, badges, photo ID |
| **Poste de pointage** | `/scan` | Scanner QR + caméra + son + détection anomalies |
| **Badges** | `/badges` | Génération, PDF, révocation |
| **Rapports** | `/reports` | Exports CSV/Excel/PDF |
| **Congés** | `/leaves` | Congés + absences justifiées |
| **Paramètres** | `/settings` | Horaires, jours fériés, préférences |
| **Journal d'audit** | `/audit-log` | Traçabilité de toutes les actions |

## 🔍 Détails importants

### Poste de pointage (Scan)
- Scan QR → vérification d'identité (photo 4×4)
- Détection anomalies : re-scan rapide, départ manquant
- Affichage 15 secondes + avertissements
- Mode hors-ligne avec synchronisation

### Journal d'audit
- Filtres : action, entité, utilisateur, dates, recherche
- Pagination
- Voir : actions login/logout, CRUD, scans, imports

### Congés / Absences
- Types : `leave` / `justified`
- L'employé en congé ≠ absent
- Filtres par période, utilisateur, type

### Scripts de base de données

```sql
CREATE DATABASE origami_db;
```

Pour un nouveau membre de l'équipe :
```bash
npm install
npm run dev
```

## 🛠 Stack Technique
- React 18 + Vite
- TanStack Query (Cache + mutations)
- date-fns (dates en français)
- Tailwind CSS + shadcn/ui
- Axios (avec interceptor retry)
- QR code scanner (caméra)
- Export CSV/Excel/PDF
