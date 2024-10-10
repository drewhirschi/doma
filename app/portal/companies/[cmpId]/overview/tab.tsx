"use client";

import {
  ActionIcon,
  Badge,
  Box,
  Button,
  Group,
  Paper,
  SimpleGrid,
  Space,
  Spoiler,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { GoogleMap, Marker, useJsApiLoader } from "@react-google-maps/api";
import {
  IconBrandLinkedin,
  IconDownload,
  IconExternalLink,
  IconMapPinFilled,
} from "@tabler/icons-react";

import { AddToDealModal } from "../companies/AddToDealModal";
import { ChangeLinkedInProfileModal } from "./ChangeLinkedInProfileModal";
import CompanySummaryEditor from "@/ux/components/CompanySummaryEditor";
import Link from "next/link";
import { LogosMenu } from "./LogosMenu";
import MetadataItem from "@/ux/components/MetadataItem";
import type { Tables } from "@/shared/types/supabase-generated";
import { actionWithNotification } from "@/ux/clientComp";
import { queueFindIndustryCompanies } from "./actions";
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
  linkedInProfile,
}: {
  companyProfile: CompanyProfile_SB;
  linkedInProfile: LinkedInProfile_SB | undefined | null;
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
        <Paper radius={8} withBorder p={"xs"}>
          <Group justify="space-between">
            <Title order={4} mb={"sm"}>
              LinkedIn Profile{" "}
              {linkedInProfile && (
                <ActionIcon
                  size={"xs"}
                  variant="transparent"
                  component={Link}
                  href={linkedInProfile.url}
                  target="_blank"
                >
                  <IconExternalLink />
                </ActionIcon>
              )}
            </Title>
            <ChangeLinkedInProfileModal
              liProfile={linkedInProfile}
              company={companyProfile}
            />
          </Group>
          {linkedInProfile != null && (
            <>
              <Text fw={500}>Description</Text>
              <Spoiler maxHeight={80} showLabel="Show more" hideLabel="Hide">
                <Text size="sm">{linkedInProfile.description}</Text>
              </Spoiler>
              <Space h={"sm"} />
              <SimpleGrid cols={2}>
                <MetadataItem
                  header="Area"
                  text={linkedInProfile.hq_area ?? ""}
                />
                <MetadataItem
                  header="Founded"
                  text={linkedInProfile.founded_year?.toString() ?? ""}
                />
                <MetadataItem
                  header="Head count"
                  text={linkedInProfile.headcountRange ?? ""}
                />

                <Box>
                  <Text fw={500}>Industries</Text>
                  {linkedInProfile.industries?.map((i) => (
                    <Badge variant="light" color="blue" key={i}>
                      {i}
                    </Badge>
                  ))}
                </Box>
              </SimpleGrid>
            </>
          )}
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
