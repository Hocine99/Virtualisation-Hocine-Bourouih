# Cloud Car Rental 🚗☁️

Application de location de voitures - Architecture microservices avec Kubernetes

![Kubernetes](https://img.shields.io/badge/Kubernetes-326CE5?logo=kubernetes&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?logo=docker&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-339933?logo=node.js&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?logo=postgresql&logoColor=white)

---

## 👥 Auteurs

**Hocine BOUROUIH** &
**Mohamed AIDAOUI**

---

## 📖 Description

Application microservices pour gérer un parc de voitures et des locations, avec :
- 2 services REST (Node.js + Express)
- Base PostgreSQL
- API Gateway Ingress NGINX
- Interface web moderne
- Sécurité NetworkPolicy

---

## 🏗️ Architecture

```
Utilisateur → Ingress NGINX → cars-service (port 3000) → Interface Web
                            ↓
                         rental-service (port 4000) ↔ PostgreSQL (port 5432)
```

---

## ✅ Prérequis

- Docker Desktop (démarré)
- minikube + kubectl installés
- Navigateur web

---

## 🚀 Installation rapide

### 1. Cloner le projet
```bash
git clone https://github.com/Hocine99/Virtualisation-Hocine-Bourouih.git
cd projet
cd cloud-car-rental
```

### 2. Démarrer minikube
```bash
minikube start
minikube addons enable ingress
```

### 3. Déployer tout
```bash
# PostgreSQL
kubectl apply -f postgres-secret.yaml
kubectl apply -f postgres-init-configmap.yaml
kubectl apply -f postgres-deployment.yaml
kubectl apply -f postgres-service.yaml
kubectl apply -f postgres-networkpolicy.yaml

# Cars service
kubectl apply -f cars-service/cars-deployment.yaml
kubectl apply -f cars-service/cars-service.yaml

# Rental service
kubectl apply -f rental-service/rental-deployment.yaml
kubectl apply -f rental-service/rental-service.yaml

# Ingress
kubectl apply -f cars-service/cars-ingress.yaml
```

### 4. Vérifier
```bash
kubectl get pods    # Tous en Running
kubectl get svc     # Services créés
kubectl get ingress # Ingress actif
```

### 5. Exposer l'application
**Ouvrir un terminal dédié (le laisser ouvert) :**
```bash
minikube tunnel
```
*Fournir le mot de passe admin si demandé.*

---

## 🧪 Utilisation

### Interface web (recommandé)
Ouvrir dans un navigateur :
```
http://127.0.0.1/ui
```

**Fonctionnalités :**
- Voir les 3 voitures et leur statut (Disponible/Louée)
- Voir les locations existantes
- Créer une nouvelle location
- Supprimer une location

### API REST
```bash
# Liste des voitures
curl http://127.0.0.1/cars

# Liste des locations
curl http://127.0.0.1/rentals

# Créer une location
curl -X POST http://127.0.0.1/rentals \
  -H "Content-Type: application/json" \
  -d '{"customer":"Charlie","carId":1,"startDate":"2026-03-01","endDate":"2026-03-05"}'

# Supprimer une location
curl -X DELETE http://127.0.0.1/rentals/1
```

### Vérifier la base de données
```bash
kubectl exec -it $(kubectl get pods -l app=postgres -o jsonpath='{.items[0].metadata.name}') -- psql -U carrental -d carrental -c "SELECT * FROM rentals;"
```

---

## 📂 Structure

```
cloud-car-rental/
├── cars-service/              # Service voitures + Front-end
│   ├── app.js
│   ├── Dockerfile
│   ├── public/index.html
│   ├── cars-deployment.yaml
│   ├── cars-service.yaml
│   └── cars-ingress.yaml
├── rental-service/            # Service locations + PostgreSQL
│   ├── app.js
│   ├── Dockerfile
│   ├── rental-deployment.yaml
│   └── rental-service.yaml
├── postgres-secret.yaml
├── postgres-init-configmap.yaml
├── postgres-deployment.yaml
├── postgres-service.yaml
└── postgres-networkpolicy.yaml
```

---

## 🛠️ Technologies

| Techno | Rôle |
|--------|------|
| Node.js 20 + Express | Microservices REST |
| PostgreSQL 16 | Base de données |
| Docker | Containerisation |
| Kubernetes (minikube) | Orchestration |
| Ingress NGINX | API Gateway |

---

## ✨ Fonctionnalités

### Paliers obligatoires
- ✅ 10/20 : Service dockerisé + Kubernetes
- ✅ 12/20 : Gateway Ingress
- ✅ 14/20 : Deuxième service + communication inter-services
- ✅ 16/20 : Base PostgreSQL + persistance

### Bonus
- ✅ Interface web moderne
- ✅ NetworkPolicy sécurité
- ✅ Validation inter-services
- ✅ Gestion conflits de dates
- ✅ Synchronisation bidirectionnelle


---

## 🔗 Liens

- **Dépôt** : https://github.com/Hocine99/Virtualisation-Hocine-Bourouih.git
- **Images Docker** : https://hub.docker.com/u/hocinebour
- **Documentation** : Voir rapport PDF

