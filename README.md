Projet-Web-H26-Bibliotheque-frontend

Frontend du projet bibliothèque (EJS, Express) – Projet 2

 Équipe IFM30-12

Membres de l’équipe :

Abdelouahab Adel
Bensalem Abdelhak
Hammachin Rayane Lakhdar
Messahli Zaid


Répartition des tâches

Chaque membre est responsable du développement des interfaces utilisateur (EJS) pour ses tables, incluant :

pages de liste
formulaires (ajout / modification)
validation des formulaires
interaction avec le backend (API)


 Abdelouahab

Tables : Users & Roles

Responsabilités :

page login (connexion)
gestion authentification (frontend)
CRUD Users (interfaces)
CRUD Roles (interfaces)
gestion des sessions (affichage utilisateur connecté)

Pages :

views/login.ejs
views/users/index.ejs
views/users/create.ejs
views/users/edit.ejs
views/roles/index.ejs
views/roles/create.ejs
views/roles/edit.ejs


 Rayane

Tables : Books & Categories

Responsabilités :

affichage liste livres
CRUD livres
CRUD catégories
affichage des relations (livre → catégorie)

Pages :

views/books/index.ejs
views/books/create.ejs
views/books/edit.ejs
views/categories/index.ejs
views/categories/create.ejs
views/categories/edit.ejs


Zaid

Tables : Loans & Authors

Responsabilités :

CRUD auteurs
CRUD emprunts
gestion logique emprunt (affichage)
validation formulaires

Pages :

views/authors/index.ejs
views/authors/create.ejs
views/authors/edit.ejs
views/loans/index.ejs
views/loans/create.ejs
views/loans/edit.ejs
 
 Abdelhak

Tables : Publishers & Reservations

Responsabilités :

CRUD maisons d’édition
CRUD réservations
affichage relations (livre → réservation)

Pages :

views/publishers/index.ejs
views/publishers/create.ejs
views/publishers/edit.ejs
views/reservations/index.ejs
views/reservations/create.ejs
views/reservations/edit.ejs



Structure du projet
views/
  partials/
    header.ejs
    footer.ejs
    navbar.ejs

  users/
  roles/
  books/
  categories/
  authors/
  loans/
  publishers/
  reservations/


  
Fonctionnalités communes (partagées)

Tous les membres utilisent :

navbar (menus)
header / footer
messages d’erreur (validation)
appels API vers backend
 
 Lien backend

Backend utilisé :
https://github.com/abdelouahab2742615/Projet-Web-H26-Bibliotheque
