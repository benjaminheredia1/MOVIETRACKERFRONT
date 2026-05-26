import { useState, useCallback } from "react";
import { Search, Star, Plus, TrendingUp, Loader2, Film, Tv } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { searchMedia, getRecommendations, addItem } from "@/services/api";
import { getPosterUrl, getBackdropUrl } from "@/lib/helpers";
import type { MediaResult } from "@/types";
import { toast } from "sonner";

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<MediaResult[]>([]);
  const [recommendations, setRecommendations] = useState<MediaResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingRec, setLoadingRec] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<MediaResult | null>(null);
  const [addingItem, setAddingItem] = useState(false);

  const handleSearch = useCallback(async () => {
    if (!query.trim()) return;
    setLoading(true);
    try {
      const data = await searchMedia(query);
      setResults(data || []);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al buscar");
    } finally {
      setLoading(false);
    }
  }, [query]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSearch();
  };

  const loadRecommendations = useCallback(async () => {
    setLoadingRec(true);
    try {
      const data = await getRecommendations();
      setRecommendations(data || []);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al cargar recomendaciones");
    } finally {
      setLoadingRec(false);
    }
  }, []);

  const handleAddToWatchlist = async (media: MediaResult) => {
    setAddingItem(true);
    try {
      await addItem({
        tmdb_id: media.id,
        name: media.name || media.original_name,
        original_name: media.original_name,
        overview: media.overview,
        poster_path: media.poster_path,
        backdrop_path: media.backdrop_path,
        media_type: media.media_type || "movie",
        original_language: media.original_language,
        popularity: media.popularity,
        first_air_date: media.first_air_date,
        vote_average: media.vote_average,
        vote_count: media.vote_count,
        adult: media.adult,
        genre_ids: JSON.stringify(media.genre_ids || []),
        origin_country: JSON.stringify(media.origin_country || []),
        status: "pending",
      });
      toast.success(`"${media.name || media.original_name}" agregado a tu watchlist`);
      setSelectedMedia(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al agregar");
    } finally {
      setAddingItem(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Buscar Películas y Series</h1>
        <p className="mt-1 text-muted-foreground">
          Busca en TMDB y agrega contenido a tu watchlist
        </p>
      </div>

      {/* Search Bar */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="search-input"
            placeholder="Buscar películas, series..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            className="pl-10 h-11"
          />
        </div>
        <Button onClick={handleSearch} disabled={loading} className="h-11 px-6">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Buscar"}
        </Button>
        <Button
          variant="outline"
          onClick={loadRecommendations}
          disabled={loadingRec}
          className="h-11 gap-2"
        >
          <TrendingUp className="h-4 w-4" />
          <span className="hidden sm:inline">Tendencias</span>
        </Button>
      </div>

      {/* Search Results */}
      {results.length > 0 && (
        <section>
          <h2 className="mb-4 text-xl font-semibold">Resultados de búsqueda</h2>
          <MediaGrid items={results} onSelect={setSelectedMedia} />
        </section>
      )}

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <section>
          <h2 className="mb-4 text-xl font-semibold flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Tendencias
          </h2>
          <MediaGrid items={recommendations} onSelect={setSelectedMedia} />
        </section>
      )}

      {/* Empty state */}
      {results.length === 0 && recommendations.length === 0 && !loading && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted mb-4">
            <Search className="h-10 w-10 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold">Empieza a buscar</h3>
          <p className="mt-1 text-sm text-muted-foreground max-w-sm">
            Escribe el nombre de una película o serie, o explora las tendencias actuales
          </p>
        </div>
      )}

      {/* Detail Dialog */}
      <Dialog open={!!selectedMedia} onOpenChange={() => setSelectedMedia(null)}>
        {selectedMedia && (
          <DialogContent className="max-w-2xl overflow-hidden p-0">
            {selectedMedia.backdrop_path && (
              <div className="relative h-48 w-full">
                <img
                  src={getBackdropUrl(selectedMedia.backdrop_path)}
                  alt=""
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
              </div>
            )}
            <div className="p-6 space-y-4">
              <DialogHeader>
                <DialogTitle className="text-2xl">
                  {selectedMedia.name || selectedMedia.original_name}
                </DialogTitle>
                <DialogDescription className="flex items-center gap-2 pt-1">
                  <Badge variant="secondary" className="gap-1">
                    {selectedMedia.media_type === "tv" ? (
                      <Tv className="h-3 w-3" />
                    ) : (
                      <Film className="h-3 w-3" />
                    )}
                    {selectedMedia.media_type === "tv" ? "Serie" : "Película"}
                  </Badge>
                  {selectedMedia.vote_average > 0 && (
                    <Badge variant="outline" className="gap-1">
                      <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                      {selectedMedia.vote_average.toFixed(1)}
                    </Badge>
                  )}
                  {selectedMedia.first_air_date && (
                    <Badge variant="outline">
                      {selectedMedia.first_air_date.split("-")[0]}
                    </Badge>
                  )}
                </DialogDescription>
              </DialogHeader>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {selectedMedia.overview || "Sin descripción disponible."}
              </p>
              <DialogFooter>
                <Button
                  onClick={() => handleAddToWatchlist(selectedMedia)}
                  disabled={addingItem}
                  className="gap-2"
                >
                  {addingItem ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Plus className="h-4 w-4" />
                  )}
                  Agregar a Watchlist
                </Button>
              </DialogFooter>
            </div>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
}

// ==========================================
// Media Grid sub-component
// ==========================================
function MediaGrid({
  items,
  onSelect,
}: {
  items: MediaResult[];
  onSelect: (m: MediaResult) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
      {items.map((item) => (
        <Card
          key={item.id}
          className="group cursor-pointer overflow-hidden border-0 bg-card shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
          onClick={() => onSelect(item)}
        >
          <div className="relative aspect-[2/3] overflow-hidden">
            <img
              src={getPosterUrl(item.poster_path)}
              alt={item.name || item.original_name}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-full transition-transform duration-300 group-hover:translate-y-0">
              <Button size="sm" className="w-full gap-1.5 text-xs">
                <Plus className="h-3.5 w-3.5" />
                Ver detalles
              </Button>
            </div>
            {item.vote_average > 0 && (
              <div className="absolute right-2 top-2 flex items-center gap-1 rounded-md bg-black/70 px-2 py-1 text-xs font-medium text-white backdrop-blur-sm">
                <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                {item.vote_average.toFixed(1)}
              </div>
            )}
          </div>
          <CardContent className="p-3">
            <h3 className="truncate text-sm font-medium">
              {item.name || item.original_name}
            </h3>
            <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
              <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                {item.media_type === "tv" ? "Serie" : "Película"}
              </Badge>
              {item.first_air_date && (
                <span>{item.first_air_date.split("-")[0]}</span>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
