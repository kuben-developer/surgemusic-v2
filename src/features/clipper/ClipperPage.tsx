"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ClipperContent } from "./clipper";
import { MontagerPlaceholder } from "./montager";

export default function ClipperPage() {
  return (
    <div className="container max-w-7xl mx-auto py-6 sm:py-8 md:py-12 px-4">
      <Tabs defaultValue="clipper" className="w-full">
        <TabsList className="grid w-full max-w-[280px] sm:max-w-md mb-6 sm:mb-8 grid-cols-2">
          <TabsTrigger value="clipper">Clipper</TabsTrigger>
          <TabsTrigger value="montager">Montager</TabsTrigger>
        </TabsList>

        <TabsContent value="clipper" className="mt-0">
          <ClipperContent />
        </TabsContent>

        <TabsContent value="montager" className="mt-0">
          <MontagerPlaceholder />
        </TabsContent>
      </Tabs>
    </div>
  );
}
