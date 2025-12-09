package router

import (
	"github.com/ewje/gossip-with-go/internal/routes"
	"github.com/go-chi/chi/middleware"
	"github.com/go-chi/chi/v5"
)

func Setup() chi.Router {
	r := chi.NewRouter()

	// Add standard middleware
	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)
	r.Use(middleware.AllowContentType("application/json"))

	setUpRoutes(r)
	return r
}

func setUpRoutes(r chi.Router) {
	// Groups all routes under /api based on your initial design,
	// or matches the sample app's root grouping.
	r.Route("/api", func(r chi.Router) {
		r.Group(routes.GetRoutes())
	})
}
