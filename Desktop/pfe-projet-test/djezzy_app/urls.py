from django.urls import path, include
from .views import login_view
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
    path('auth/login/', login_view, name='login-candidat'),

    path('auth/logout/', logout_view, name='logout'),
    path('auth/register/', RegisterCandidatView.as_view(), name='register-candidat'),
        path('candidats/postuler/', CandidatViewSet.as_view({'post': 'postuler_offre_api'}), name='postuler-offre')
]
