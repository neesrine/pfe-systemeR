from django.urls import path, include
from .views import login_view, liste_offres_api, detail_candidature
from rest_framework.routers import DefaultRouter
from .views import (
    login_view, liste_offres_api, detail_candidature, logout_view, RegisterCandidatView,
    home, a_propos, admin_profile, candidat_profile, candidats, connexion, contact,
    creer_annonce, entretien, liste_des_offres, mes_candidats, offres_emploi, offres_candidat,
    responsable, tableau_de_bord
)
from .views import (
    CandidatViewSet,
    DomaineViewSet,
    SpecialiteViewSet,
    LangueViewSet,
    CompetenceViewSet,
    ExperienceViewSet,
    FormationViewSet,
    OffreViewSet,
    CandidatureViewSet,
    RegionViewSet,
    RegisterCandidatView,
    logout_view,
    DepartementViewSet,
    EntretienViewSet, CandidatLangueViewSet
)

# Créer un routeur pour générer les routes automatiquement
router = DefaultRouter()
router.register(r'candidats', CandidatViewSet, basename='candidat')
router.register(r'domains', DomaineViewSet)
router.register(r'specialites', SpecialiteViewSet)
router.register(r'langues', LangueViewSet)
router.register(r'competences', CompetenceViewSet)
router.register(r'experiences', ExperienceViewSet)
router.register(r'formations', FormationViewSet)
router.register(r'offres', OffreViewSet, basename='offre')
router.register(r'candidatures', CandidatureViewSet)
router.register(r'regions', RegionViewSet)
router.register(r'departements', DepartementViewSet)
router.register(r'entretien', EntretienViewSet)
router.register(r'candidat-langues', CandidatLangueViewSet)
# Inclure les URLs générées par le routeur
urlpatterns = [
    path('', include(router.urls)),  # Inclure toutes les routes générées automatiquement sous la racine de l'API
    path('home', home, name='home'),
    path('a-propos/', a_propos, name='a-propos'),
    path('admin-profile/', admin_profile, name='admin-profile'),
    path('candidat-profile/', candidat_profile, name='candidat-profile'),
    path('candidats/', candidats, name='candidats'),
    path('connexion/', connexion, name='connexion'),
    path('contact/', contact, name='contact'),
    path('creer-annonce/', creer_annonce, name='creer-annonce'),
    path('entretien/', entretien, name='entretien'),
    path('liste-des-offres/', liste_des_offres, name='liste-des-offres'),
    path('mes-candidats/', mes_candidats, name='mes-candidats'),
    path('offres-emploi/', offres_emploi, name='offres-emploi'),
    path('offres-candidat/', offres_candidat, name='offres-candidat'),
    path('responsable/', responsable, name='responsable'),
    path('tableau-de-bord/', tableau_de_bord, name='tableau-de-bord'),
    # Routes d'authentification
    path('auth/login/', login_view, name='login-candidat'),
    path('auth/logout/', logout_view, name='logout'),
    path('auth/register/', RegisterCandidatView.as_view(), name='register-candidat'),
    
    # Routes personnalisées pour les candidats
    path('candidats/postuler/', CandidatViewSet.as_view({'post': 'postuler_offre'}), name='postuler-offre'),
    path('candidats/profil/', CandidatViewSet.as_view({'get': 'profile'}), name='profil-candidat'),
    path('candidats/update-profil/', CandidatViewSet.as_view({'put': 'update_profile', 'patch': 'update_profile'}), name='update-profil-candidat'),
    path('candidats/mes-candidatures/', CandidatViewSet.as_view({'get': 'mes_candidatures'}), name='mes-candidatures'),
    
    # Routes personnalisées pour les offres
    # path('', base, name='base'),  # URL pour la vue de base
    path('offres/liste/', liste_offres_api, name='liste-offres'),
    path('candidatures/<int:id>/', detail_candidature, name='detail-candidature'),

    # Added URL patterns to match expected URLs with .html extensions
    path('offres_d\'emploi.html', offres_emploi, name='offres-emploi-html'),
    path('A_propos.html', a_propos, name='a-propos-html'),
    path('contact.html', contact, name='contact-html'),
    path('connexion.html', connexion, name='connexion-html'),
]
