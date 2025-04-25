from rest_framework import viewsets
from django.contrib.auth.models import User
from django.utils import timezone
from .serializers import OffreSerializer, CandidatureSerializer
from .permissions import IsAdmin 

from django.shortcuts import redirect
from django.contrib.auth import login
from django.contrib.auth import logout
from rest_framework.exceptions import ValidationError
from django.shortcuts import render
from django.contrib.auth import authenticate
from rest_framework import permissions
from rest_framework.permissions import AllowAny,IsAuthenticated, IsAdminUser
from rest_framework.decorators import action, api_view
from rest_framework.response import Response
from rest_framework import status
from .models import (
    Candidat, Langue, Domaine, Specialite, Competence,
    Formation, Experience, Offre, Candidature, Region
)
from .serializers import (
    CandidatSerializer,
    LangueSerializer,
    DomaineSerializer,
    SpecialiteSerializer,
    CompetenceSerializer,
    FormationSerializer,
    ExperienceSerializer,
    OffreSerializer,
    CandidatureSerializer,
    RegionSerializer
)


def home(request):
    """
    Affiche la page d'accueil de l'application.
    """
    return render(request, 'djezzy_app/home.html')

from rest_framework import viewsets




class IsAdmin(permissions.BasePermission):
    """
    Permission personnalisée qui vérifie si l'utilisateur est un administrateur (role=admin).
    """
    def has_permission(self, request, view):
        return request.user and request.user.role == 'admin'


class IsCandidat(permissions.BasePermission):
    """
    Permission personnalisée qui vérifie si l'utilisateur est un candidat (role=candidat).
    """
    def has_permission(self, request, view):
       return request.user.is_authenticated and hasattr(request.user, 'role') and request.user.role == 'candidat'



@api_view(['POST'])
def logout_view(request):
    logout(request)
    return Response({"message": "Déconnexion réussie"})




from rest_framework.response import Response
from rest_framework.decorators import api_view
from rest_framework import status
from django.contrib.auth.models import User
from .models import Candidat



# views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .serializers import RegisterCandidatSerializer




class RegisterCandidatView(APIView):
    def post(self, request):
        serializer = CandidatSerializer(data=request.data)
        if serializer.is_valid():
            candidat = serializer.save()
            # Hachage du mot de passe
            candidat.set_password(request.data.get('password'))
            candidat.save()
            return Response({"message": "Compte candidat créé avec succès"}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone

from .models import Candidat, Offre, Candidature
from .serializers import CandidatSerializer

class CandidatViewSet(viewsets.ModelViewSet):
    """
    Permet aux candidats de gérer leur propre compte et leurs informations personnelles.
    """
    queryset = Candidat.objects.all()
    serializer_class = CandidatSerializer
    permission_classes = [IsAuthenticated]

    @action(detail=False, methods=['post'], permission_classes=[IsAuthenticated])
    def postuler_offre_api(self, request):
        """
        Permet à un candidat de postuler à une offre d'emploi.
        Un candidat peut postuler à une offre une seule fois. Si le candidat a déjà postulé, 
        une erreur est retournée. La date de postulation est ajoutée automatiquement.
        """
        # Vérifier si l'utilisateur est authentifié et est un candidat
        if not request.user.is_authenticated:
            return Response({"detail": "Vous devez être authentifié pour postuler."}, status=status.HTTP_403_FORBIDDEN)

        try:
            # Récupérer le candidat associé à l'utilisateur
            candidat = request.user.candidat
        except Candidat.DoesNotExist:
            return Response({"detail": "Aucun candidat trouvé pour cet utilisateur."}, status=status.HTTP_403_FORBIDDEN)

        # Récupération de l'ID de l'offre depuis la requête
        offre_id = request.data.get('offre')

        # Vérifier si l'offre existe
        try:
            offre = Offre.objects.get(id=offre_id)
        except Offre.DoesNotExist:
            return Response({"detail": "Offre introuvable"}, status=status.HTTP_404_NOT_FOUND)

        # Vérifier si le candidat a déjà postulé à cette offre
        if Candidature.objects.filter(candidat=candidat, offre=offre).exists():
            return Response({"detail": "Vous avez déjà postulé à cette offre."}, status=status.HTTP_400_BAD_REQUEST)

        # Création de la candidature avec la date de postulation automatique
        Candidature.objects.create(
            candidat=candidat,
            offre=offre,
            date_postulation=timezone.now()  # Ajout de la date de postulation automatique
        )

        return Response({"detail": "Candidature réussie"}, status=status.HTTP_201_CREATED)


from rest_framework import viewsets
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Offre, Candidature
from .serializers import OffreSerializer, CandidatureSerializer
from .permissions import IsAdmin



class OffreViewSet(viewsets.ModelViewSet):
    """
    Permet à l'administrateur de gérer les offres d'emploi de sa région uniquement.
    """
    queryset = Offre.objects.all()
    serializer_class = OffreSerializer
    permission_classes = [AllowAny]  # Tu peux mettre une autre permission si nécessaire

    def get_queryset(self):
        """
        Retourne les offres de l'administrateur uniquement pour sa propre région.
        Si l'utilisateur est un administrateur, il peut gérer les offres de toutes les régions.
        """
        if self.request.user.is_staff:
            return Offre.objects.all()
        else:
            try:
                admin = self.request.user.admin  # accès à l'objet Admin lié
                return Offre.objects.filter(admin=admin, region=admin.region)
            except AttributeError:
                return Offre.objects.none()

    @action(detail=True, methods=['get'], permission_classes=[IsAdmin])
    def candidats(self, request, pk=None):
        """
        Permet à l'administrateur de voir les candidats ayant postulé à une offre spécifique.
        """
        offre = self.get_object()
        candidatures = Candidature.objects.filter(offre=offre)
        serializer = CandidatureSerializer(candidatures, many=True)
        return Response(serializer.data)


class DomaineViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Permet à l'administrateur de consulter les domaines des candidats, mais pas de les modifier.
    """
    queryset = Domaine.objects.all()
    serializer_class = DomaineSerializer
    permission_classes = [AllowAny]  # L'admin peut consulter mais ne peut pas modifier


class SpecialiteViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Permet à l'administrateur de consulter les spécialités des candidats, mais pas de les modifier.
    """
    queryset = Specialite.objects.all()
    serializer_class = SpecialiteSerializer
    permission_classes = [AllowAny]  # L'admin peut consulter mais ne peut pas modifier


class LangueViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Permet à l'administrateur de consulter les langues des candidats, mais pas de les modifier.
    """
    queryset = Langue.objects.all()
    serializer_class = LangueSerializer
   # permission_classes = [AllowAny]  # L'admin peut consulter mais ne peut pas modifier


class CompetenceViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Permet à l'administrateur de consulter les compétences des candidats, mais pas de les modifier.
    """
    queryset = Competence.objects.all()
    serializer_class = CompetenceSerializer
    permission_classes = [AllowAny]  # L'admin peut consulter mais ne peut pas modifier


class ExperienceViewSet(viewsets.ModelViewSet):
    """
    Permet au candidat de gérer ses expériences professionnelles et permet à l'administrateur de consulter les expériences des candidats de sa région.
    """
    queryset = Experience.objects.all()
    serializer_class = ExperienceSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        """
        Retourne uniquement les expériences du candidat connecté ou toutes les expériences pour les administrateurs.
        """
        if self.request.user.is_staff:
            return Experience.objects.all()  # L'administrateur peut voir toutes les expériences
        else:
            # Retourner uniquement les expériences du candidat connecté
            return Experience.objects.filter(candidat=self.request.user.candidat)

    def perform_create(self, serializer):
        """
        Crée une expérience associée au candidat connecté.
        """
        if not hasattr(self.request.user, 'candidat'):
            raise ValidationError("Ce compte n'est pas un candidat.")
        serializer.save(candidat=self.request.user.candidat)

    @action(detail=False, methods=['get'], permission_classes=[AllowAny, IsAdmin])
    def experiences_par_region(self, request):
        """
        Permet à l'administrateur de voir les expériences des candidats de sa région.
        """
        if not request.user.is_staff:
            return Response({"detail": "Accès refusé."}, status=status.HTTP_403_FORBIDDEN)
        
        region = request.user.recruteur.region  # Supposons que chaque recruteur a une région
        candidats = Candidat.objects.filter(region=region)
        experiences = Experience.objects.filter(candidat__in=candidats)
        serializer = ExperienceSerializer(experiences, many=True)
        return Response(serializer.data)


class FormationViewSet(viewsets.ModelViewSet):
    """
    Permet au candidat de gérer ses formations et permet à l'administrateur de consulter les formations des candidats de sa région.
    """
    queryset = Formation.objects.all()  # ✅ nécessaire pour le router
    serializer_class = FormationSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        """
        Retourne uniquement les formations du candidat connecté ou toutes les formations pour les administrateurs.
        """
        if self.request.user.is_staff:
            return Formation.objects.all()
        else:
            return Formation.objects.filter(candidat=self.request.user.candidat)

    def perform_create(self, serializer):
        """
        Crée une formation associée au candidat connecté.
        """
        if not hasattr(self.request.user, 'candidat'):
            raise ValidationError("Ce compte n'est pas un candidat.")
        serializer.save(candidat=self.request.user.candidat)

    @action(detail=False, methods=['get'], permission_classes=[AllowAny])
    def formations_par_region(self, request):
        """
        Permet à l'administrateur de voir les formations des candidats de sa région.
        """
        if not request.user.is_staff:
            return Response({"detail": "Accès refusé."}, status=status.HTTP_403_FORBIDDEN)

        region = request.user.admin.region
        formations = Formation.objects.filter(candidat__region=region)
        serializer = FormationSerializer(formations, many=True)
        return Response(serializer.data)

  

class CandidatureViewSet(viewsets.ModelViewSet):
    """
    Permet à l'administrateur de gérer les candidatures (changer le statut)
    pour les offres dans sa région.
    """
    queryset = Candidature.objects.all()
    serializer_class = CandidatureSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        """
        Filtre les candidatures en fonction de la région de l'administrateur
        """
        # Vérifie si l'utilisateur a un attribut 'admin'
        if hasattr(self.request.user, 'admin'):
            admin = self.request.user.admin  # Récupère l'admin associé à l'utilisateur
        else:
            return Candidature.objects.none()  # Retourne un queryset vide si l'utilisateur n'est pas un admin

        return Candidature.objects.filter(offre__region=admin.region)

    def perform_create(self, serializer):
        """
        Lorsqu'un candidat postule à une offre, cette méthode s'assure que la date de postulation 
        est ajoutée automatiquement.
        """
        serializer.save()  # La sauvegarde crée la candidature avec la date de postulation automatiquement

    @action(detail=True, methods=['patch'], permission_classes=[IsAdmin])
    def changer_statut(self, request, pk=None):
        """
        Permet à l'administrateur de changer le statut d'une candidature (en attente, accepté, refusé).
        
        Cette action est réservée aux administrateurs et ne peut affecter que les candidatures
        des offres dans la même région que l'administrateur.
        """
        candidature = self.get_object()  # Récupère la candidature
        statut = request.data.get('statut')

        if statut not in ['en_attente', 'accepte', 'refuse']:
            return Response({'detail': 'Statut invalide'}, status=status.HTTP_400_BAD_REQUEST)

        # Vérifie que la candidature fait partie de la région de l'admin
        if hasattr(request.user, 'admin') and candidature.offre.region != request.user.admin.region:
            return Response({'detail': 'Accès interdit aux candidatures d\'autres régions.'}, status=status.HTTP_403_FORBIDDEN)

        candidature.statut = statut
        candidature.save()
        return Response({'detail': 'Statut mis à jour'}, status=status.HTTP_200_OK)



class RegionViewSet(viewsets.ReadOnlyModelViewSet):  # Lecture seule
    queryset = Region.objects.all()
    serializer_class = RegionSerializer
    permission_classes = [AllowAny]  #


from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.contrib.auth import authenticate, login


# djezzy_app/views.py
from django.shortcuts import render, redirect
from django.contrib.auth import authenticate, login
from django.contrib import messages
from django.http import HttpResponse

@api_view(['POST'])
def login_view(request):
    email = request.data.get('email')
    password = request.data.get('password')
    user = authenticate(request, username=email, password=password)

    if user is not None:
        login(request, user)  # Enregistre la session
        return Response({'message': 'Connecté avec succès'})
    else:
        return Response({'error': 'Identifiants invalides'}, status=400)





from .models import Entretien, Departement
from .serializers import EntretienSerializer, DepartementSerializer
class EntretienViewSet(viewsets.ModelViewSet):
    queryset = Entretien.objects.all()
    serializer_class = EntretienSerializer

class DepartementViewSet(viewsets.ModelViewSet):
    queryset = Departement.objects.all()
    serializer_class = DepartementSerializer

    
# djezzy_app/views.py
from rest_framework.decorators import api_view, permission_classes

@api_view(['GET'])
@permission_classes([IsAuthenticated])  # S'assurer que l'utilisateur est authentifié
def liste_offres_api(request):
    offres = Offre.objects.all()  # Récupérer toutes les offres
    serializer = OffreSerializer(offres, many=True)
    return Response(serializer.data)