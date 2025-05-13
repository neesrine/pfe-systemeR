from django.views.generic import View
from django.http import HttpResponse
from django.conf import settings
from django.views.static import serve
import os
from django.shortcuts import render

class FrontendAppView(View):
    """
    Serves the compiled React app or redirects to home page template if build not found
    """
    def get(self, request):
        try:
            with open(os.path.join(settings.BASE_DIR, 'frontend', 'build', 'index.html')) as f:
                return HttpResponse(f.read())
        except FileNotFoundError:
            # Serve Django home template as fallback
            return render(request, 'djezzy_app/home.html')
