from django.urls import path, include
from .views import login_view, liste_offres_api, detail_candidature
from rest_framework.routers import DefaultRouter
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
    EntretienViewSet
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

# Inclure les URLs générées par le routeur
urlpatterns = [
    path('', include(router.urls)),  # Inclure toutes les routes générées automatiquement sous la racine de l'API
    
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
    path('offres/liste/', liste_offres_api, name='liste-offres'),
    path('candidatures/<int:id>/', detail_candidature, name='detail-candidature'),
]