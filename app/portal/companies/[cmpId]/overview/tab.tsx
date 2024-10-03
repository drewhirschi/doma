"use client";

import { ActionIcon, Box, Button, Group, Paper, Stack } from "@mantine/core";
import { queueFindIndustryCompanies } from "./actions";
import { AddToDealModal } from "../companies/AddToDealModal";
import CompanySummaryEditor from "@/ux/components/CompanySummaryEditor";
import { LogosMenu } from "./LogosMenu";
import type { Tables } from "@/shared/types/supabase-generated";
import { actionWithNotification } from "@/ux/clientComp";
import { useJsApiLoader, GoogleMap, Marker } from "@react-google-maps/api";
import { IconDownload, IconMapPinFilled } from "@tabler/icons-react";
import { renderToStaticMarkup } from "react-dom/server";

const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

const containerStyle = {
  width: "600px",
  height: "400px",
};

const markerIcon = `data:image/svg+xml;utf8,${encodeURIComponent(
  renderToStaticMarkup(<IconMapPinFilled />),
)}`;

export default function OverviewTab({
  companyProfile,
  logos,
}: {
  companyProfile: CompanyProfile_SB;
  logos: Tables<"cmp_logos">[];
}) {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: API_KEY || "",
  });

  return (
    <Group align="flex-start" m={"sm"}>
      <Stack style={{ flex: 1, minWidth: 0 }}>
        <Paper radius={8} withBorder p={"xs"}>
          <Button
            disabled={companyProfile == null}
            onClick={() => {
              actionWithNotification(() =>
                queueFindIndustryCompanies(companyProfile!.id),
              );
            }}
          >
            Find companies
          </Button>
          <AddToDealModal selectedCompanies={[companyProfile.id]} />
        </Paper>

        <Paper
          style={{
            backgroundSize: "20px 20px",
            backgroundImage:
              "repeating-linear-gradient(45deg, #ddd 0, #ddd 10px, transparent 10px, transparent 20px)",
          }}
          radius={8}
          withBorder
          p={"xs"}
        >
          {logos.map((l) => (
            <Box key={l.url} pos="relative">
              <img alt={l.alt ?? ""} src={l.url} height={100} />
              <Group gap={"xs"} pos="absolute" right={0} bottom={0}>
                <LogosMenu logo={l} />
                <ActionIcon
                  variant="filled"
                  aria-label="Download logo"
                  onClick={async () => {
                    try {
                      const response = await fetch(l.url);
                      const blob = await response.blob();
                      const url = window.URL.createObjectURL(blob);
                      const link = document.createElement("a");
                      link.href = url;
                      link.download = `${l.alt || "download"}.png`;
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                      window.URL.revokeObjectURL(url);
                    } catch (error) {
                      console.error("Download failed:", error);
                    }
                  }}
                >
                  <IconDownload
                    style={{ width: "70%", height: "70%" }}
                    stroke={1.5}
                  />
                </ActionIcon>
              </Group>
            </Box>
          ))}
        </Paper>

        <Paper id="hq-map" radius={8} withBorder p={"xs"} style={{ flex: 1 }}>
          {companyProfile.hq_lon && companyProfile.hq_lat && isLoaded && (
            <GoogleMap
              mapContainerStyle={{ width: "100%", height: "500px" }}
              center={{
                lat: companyProfile.hq_lat,
                lng: companyProfile.hq_lon,
              }}
              zoom={10}
              options={{
                streetViewControl: false,
              }}
            >
              <Marker
                position={{
                  lat: companyProfile.hq_lat,
                  lng: companyProfile.hq_lon,
                }}
                icon={{
                  url: markerIcon,
                  scaledSize: new window.google.maps.Size(30, 40),
                }}
              />
            </GoogleMap>
          )}
        </Paper>
      </Stack>

      <div style={{ flex: 1, minWidth: 0 }}>
        <CompanySummaryEditor companyProfile={companyProfile} />
      </div>
    </Group>
  );
}
