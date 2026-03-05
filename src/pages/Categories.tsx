import { sampleAssets, CATEGORIES, LOCATIONS } from "@/data/assets";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Monitor, Armchair, Zap, Package, Tv, Building2, MapPin } from "lucide-react";

const catIcons: Record<string, typeof Monitor> = {
  "IT Equipment": Monitor,
  "Office Furniture": Armchair,
  "Appliances": Zap,
  "Consumables": Package,
  "AV Equipment": Tv,
};

const Categories = () => (
  <div className="space-y-6">
    <div>
      <h1 className="text-2xl font-bold tracking-tight">Categories & Locations</h1>
      <p className="text-sm text-muted-foreground">Asset classification hierarchy</p>
    </div>

    <Tabs defaultValue="category">
      <TabsList>
        <TabsTrigger value="category">By Category</TabsTrigger>
        <TabsTrigger value="location">By Location</TabsTrigger>
      </TabsList>

      <TabsContent value="category" className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {CATEGORIES.map(cat => {
          const Icon = catIcons[cat] || Package;
          const assets = sampleAssets.filter(a => a.category === cat);
          return (
            <div key={cat} className="rounded-lg border bg-card p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm">{cat}</h3>
                  <p className="text-xs text-muted-foreground">{assets.length} assets</p>
                </div>
              </div>
              <div className="space-y-1.5">
                {assets.slice(0, 4).map(a => (
                  <div key={a.id} className="flex justify-between text-xs border rounded px-2.5 py-1.5">
                    <span className="truncate">{a.name}</span>
                    <span className="font-mono text-muted-foreground ml-2">{a.assetId}</span>
                  </div>
                ))}
                {assets.length > 4 && <p className="text-xs text-muted-foreground text-center pt-1">+{assets.length - 4} more</p>}
              </div>
            </div>
          );
        })}
      </TabsContent>

      <TabsContent value="location" className="mt-4 space-y-4">
        {LOCATIONS.map(loc => {
          const assets = sampleAssets.filter(a => a.building === loc.building);
          return (
            <div key={loc.building} className="rounded-lg border bg-card p-5">
              <div className="flex items-center gap-3 mb-4">
                <Building2 className="h-5 w-5 text-primary" />
                <h3 className="font-semibold">{loc.building}</h3>
                <span className="text-xs text-muted-foreground ml-auto">{assets.length} assets</span>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {loc.floors.map(floor => {
                  const floorAssets = assets.filter(a => a.floor === floor);
                  return (
                    <div key={floor} className="rounded border p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="text-sm font-medium">{floor}</span>
                        <span className="text-xs text-muted-foreground">({floorAssets.length})</span>
                      </div>
                      {floorAssets.length > 0 ? (
                        <div className="space-y-1">
                          {floorAssets.map(a => (
                            <p key={a.id} className="text-xs text-muted-foreground truncate">• {a.name}</p>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-muted-foreground italic">No assets</p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </TabsContent>
    </Tabs>
  </div>
);

export default Categories;
