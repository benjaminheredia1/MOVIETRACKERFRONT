import { useState, useEffect, useCallback } from "react";
import {
  Eye,
  Trash2,
  Star,
  Loader2,
  Filter,
  Film,
  Tv,
  Clock,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { getItems, markAsWatched, deleteItem } from "@/services/api";
import { getPosterUrl, formatDate } from "@/lib/helpers";
import type { Item, Filters } from "@/types";
import { toast } from "sonner";

export default function WatchlistPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<Filters>({});
  const [watchDialog, setWatchDialog] = useState<Item | null>(null);
  const [deleteDialog, setDeleteDialog] = useState<Item | null>(null);
  const [rating, setRating] = useState(5);
  const [commentary, setCommentary] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getItems(filters);
      setItems(data || []);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al cargar items");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const handleMarkAsWatched = async () => {
    if (!watchDialog) return;
    setSubmitting(true);
    try {
      await markAsWatched(watchDialog.id, { rating, commentary });
      toast.success(`"${watchDialog.name}" marcado como visto`);
      setWatchDialog(null);
      setRating(5);
      setCommentary("");
      fetchItems();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteDialog) return;
    setSubmitting(true);
    try {
      await deleteItem(deleteDialog.id);
      toast.success(`"${deleteDialog.name}" eliminado`);
      setDeleteDialog(null);
      fetchItems();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al eliminar");
    } finally {
      setSubmitting(false);
    }
  };

  const pendingCount = items.filter((i) => i.status === "pending").length;
  const watchedCount = items.filter((i) => i.status === "watched").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Mi Watchlist</h1>
        <p className="mt-1 text-muted-foreground">
          Gestiona tu lista personal de películas y series
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="border-0 bg-gradient-to-br from-blue-500/10 to-blue-600/5">
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/20">
              <Film className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{items.length}</p>
              <p className="text-xs text-muted-foreground">Total</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 bg-gradient-to-br from-amber-500/10 to-amber-600/5">
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/20">
              <Clock className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{pendingCount}</p>
              <p className="text-xs text-muted-foreground">Pendientes</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 bg-gradient-to-br from-green-500/10 to-green-600/5">
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/20">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{watchedCount}</p>
              <p className="text-xs text-muted-foreground">Vistos</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Filter className="h-4 w-4" />
          Filtrar:
        </div>
        <Select
          value={filters.status || "all"}
          onValueChange={(v) =>
            setFilters((f) => ({ ...f, status: v === "all" ? undefined : v }))
          }
        >
          <SelectTrigger id="filter-status" className="w-[140px]">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="pending">Pendientes</SelectItem>
            <SelectItem value="watched">Vistos</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={filters.media_type || "all"}
          onValueChange={(v) =>
            setFilters((f) => ({ ...f, media_type: v === "all" ? undefined : v }))
          }
        >
          <SelectTrigger id="filter-type" className="w-[140px]">
            <SelectValue placeholder="Tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="movie">Películas</SelectItem>
            <SelectItem value="tv">Series</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={filters.order_by || "added_at"}
          onValueChange={(v) =>
            setFilters((f) => ({ ...f, order_by: v }))
          }
        >
          <SelectTrigger id="filter-order" className="w-[160px]">
            <SelectValue placeholder="Ordenar por" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="added_at">Fecha agregado</SelectItem>
            <SelectItem value="name">Nombre</SelectItem>
            <SelectItem value="vote_average">Calificación TMDB</SelectItem>
            <SelectItem value="popularity">Popularidad</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={filters.order_dir || "DESC"}
          onValueChange={(v) =>
            setFilters((f) => ({ ...f, order_dir: v }))
          }
        >
          <SelectTrigger id="filter-dir" className="w-[140px]">
            <SelectValue placeholder="Dirección" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="DESC">Descendente</SelectItem>
            <SelectItem value="ASC">Ascendente</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Items List */}
      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted mb-4">
            <Film className="h-10 w-10 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold">Tu watchlist está vacía</h3>
          <p className="mt-1 text-sm text-muted-foreground max-w-sm">
            Ve a la sección de búsqueda para encontrar películas y series
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <Card
              key={item.id}
              className="group overflow-hidden border-0 bg-card shadow-sm transition-all hover:shadow-md"
            >
              <CardContent className="flex gap-4 p-4">
                {/* Poster */}
                <div className="h-28 w-20 flex-shrink-0 overflow-hidden rounded-md">
                  <img
                    src={getPosterUrl(item.poster_path, "w200")}
                    alt={item.name}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-semibold truncate">{item.name}</h3>
                      <div className="mt-1 flex flex-wrap items-center gap-2">
                        <Badge variant="outline" className="text-[10px] gap-1">
                          {item.media_type === "tv" ? (
                            <Tv className="h-3 w-3" />
                          ) : (
                            <Film className="h-3 w-3" />
                          )}
                          {item.media_type === "tv" ? "Serie" : "Película"}
                        </Badge>
                        <Badge
                          variant={item.status === "watched" ? "default" : "secondary"}
                          className="text-[10px]"
                        >
                          {item.status === "watched" ? "Visto" : "Pendiente"}
                        </Badge>
                        {item.vote_average > 0 && (
                          <span className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                            {item.vote_average.toFixed(1)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <p className="mt-2 text-xs text-muted-foreground line-clamp-2">
                    {item.overview}
                  </p>

                  <div className="mt-2 flex items-center justify-between">
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span>Agregado: {formatDate(item.added_at)}</span>
                      {item.calification_user != null && (
                        <span className="flex items-center gap-1">
                          Tu nota: <strong>{item.calification_user}/10</strong>
                        </span>
                      )}
                      {item.watched_at && (
                        <span>Visto: {formatDate(item.watched_at)}</span>
                      )}
                    </div>
                    <div className="flex gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                      {item.status !== "watched" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setWatchDialog(item)}
                          className="gap-1 text-xs"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          Marcar visto
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setDeleteDialog(item)}
                        className="gap-1 text-xs text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Mark as Watched Dialog */}
      <Dialog open={!!watchDialog} onOpenChange={() => setWatchDialog(null)}>
        {watchDialog && (
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Marcar como visto</DialogTitle>
              <DialogDescription>
                Califica "{watchDialog.name}" del 1 al 10
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div>
                <label className="text-sm font-medium">
                  Calificación: {rating}/10
                </label>
                <div className="mt-2 flex gap-1">
                  {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setRating(n)}
                      className="transition-transform hover:scale-110"
                    >
                      <Star
                        className={`h-6 w-6 ${
                          n <= rating
                            ? "fill-yellow-500 text-yellow-500"
                            : "text-muted-foreground/30"
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label htmlFor="commentary" className="text-sm font-medium">
                  Comentario (opcional)
                </label>
                <Textarea
                  id="commentary"
                  placeholder="¿Qué te pareció?"
                  value={commentary}
                  onChange={(e) => setCommentary(e.target.value)}
                  className="mt-1.5"
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setWatchDialog(null)}>
                Cancelar
              </Button>
              <Button onClick={handleMarkAsWatched} disabled={submitting} className="gap-2">
                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Eye className="h-4 w-4" />}
                Confirmar
              </Button>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteDialog} onOpenChange={() => setDeleteDialog(null)}>
        {deleteDialog && (
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Eliminar de la watchlist</DialogTitle>
              <DialogDescription>
                ¿Estás seguro de que quieres eliminar "{deleteDialog.name}" de tu watchlist? Esta acción no se puede deshacer.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleteDialog(null)}>
                Cancelar
              </Button>
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={submitting}
                className="gap-2"
              >
                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                Eliminar
              </Button>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
}
