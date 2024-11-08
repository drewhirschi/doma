"use client";

import {
  ActionIcon,
  Badge,
  Box,
  Button,
  Combobox,
  Group,
  InputBase,
  Paper,
  SimpleGrid,
  Space,
  Spoiler,
  Stack,
  Text,
  Title,
  useCombobox,
} from "@mantine/core";
import { GoogleMap, Marker, useJsApiLoader } from "@react-google-maps/api";
import { IconBrandLinkedin, IconDownload, IconExternalLink, IconMapPinFilled } from "@tabler/icons-react";

import { AddToDealModal } from "../companies/AddToDealModal";
import { ChangeLinkedInProfileModal } from "./ChangeLinkedInProfileModal";
import CompanySummaryEditor from "@/ux/components/CompanySummaryEditor";
import Link from "next/link";
import MetadataItem from "@/ux/components/MetadataItem";
import type { Tables } from "@/shared/types/supabase-generated";
import { actionWithNotification } from "@/ux/clientComp";
import { queueFindIndustryCompanies } from "./actions";
import { renderToStaticMarkup } from "react-dom/server";
import { useState, useEffect } from "react";
import SelectLogoOption from "@/ux/components/SelectLogoOption";

const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

const markerIcon = `data:image/svg+xml;utf8,${encodeURIComponent(renderToStaticMarkup(<IconMapPinFilled />))}`;

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

  const [selectedLogo, setSelectedLogo] = useState(logos[0]?.url || "");
  const [hasWhiteInLogo, setHasWhiteInLogo] = useState(false);

  const combobox = useCombobox({
    onDropdownClose: () => combobox.resetSelectedOption(),
  });

  const options = logos.map((logo) => (
    <Combobox.Option key={logo.url} value={logo.url}>
      <SelectLogoOption logo={logo.url} />
    </Combobox.Option>
  ));

  const checkLogoForWhite = (url: string) => {
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.src = url;

    img.onload = () => {
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");

      if (!context) return;

      canvas.width = img.width;
      canvas.height = img.height;
      context.drawImage(img, 0, 0);

      const imageData = context.getImageData(0, 0, img.width, img.height);
      const pixels = imageData.data;

      let containsWhite = false;

      for (let i = 0; i < pixels.length; i += 4) {
        const r = pixels[i];
        const g = pixels[i + 1];
        const b = pixels[i + 2];

        if (r > 240 && g > 240 && b > 240) {
          containsWhite = true;
          break;
        }
      }

      setHasWhiteInLogo(containsWhite);
    };
  };

  useEffect(() => {
    if (selectedLogo) {
      checkLogoForWhite(selectedLogo);
    }
  }, [selectedLogo]);

  return (
    <Group align="flex-start" m={"sm"}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <CompanySummaryEditor companyProfile={companyProfile} />
      </div>
      <Stack style={{ flex: 1, minWidth: 0 }}>
        <Paper radius={8} withBorder p={"xs"}>
          <Button
            radius="sm"
            variant="gradient"
            gradient={{ deg: 30, from: "blue.8", to: "blue.6" }}
            disabled={companyProfile == null}
            onClick={() => {
              actionWithNotification(() => queueFindIndustryCompanies(companyProfile!.id));
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
            <ChangeLinkedInProfileModal liProfile={linkedInProfile} company={companyProfile} />
          </Group>
          {linkedInProfile != null && (
            <>
              <Text fw={500}>Description</Text>
              <Spoiler maxHeight={80} showLabel="Show more" hideLabel="Hide">
                <Text size="sm">{linkedInProfile.description}</Text>
              </Spoiler>
              <Space h={"sm"} />
              <SimpleGrid cols={2}>
                <MetadataItem header="Area" text={linkedInProfile.hq_area ?? ""} />
                <MetadataItem header="Founded" text={linkedInProfile.founded_year?.toString() ?? ""} />
                <MetadataItem header="Head count" text={linkedInProfile.headcount_range ?? ""} />

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
        {logos.length > 0 && (
          <Paper
            style={{
              backgroundColor: hasWhiteInLogo ? "#e0e0e0" : "#ffffff",
            }}
            radius={8}
            withBorder
            p={"xs"}
          >
            <Box pos="relative">
              <img alt={logos.find((l) => l.url === selectedLogo)?.alt || ""} src={selectedLogo} height={100} />
              <Group gap={"xs"} pos="absolute" right={2} bottom={5}>
                <ActionIcon
                  variant="filled"
                  aria-label="Download logo"
                  onClick={async () => {
                    try {
                      const response = await fetch(selectedLogo);
                      const blob = await response.blob();
                      const url = window.URL.createObjectURL(blob);
                      const link = document.createElement("a");
                      link.href = url;
                      link.download = `${logos.find((l) => l.url === selectedLogo)?.alt || "download"}.png`;
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                      window.URL.revokeObjectURL(url);
                    } catch (error) {
                      console.error("Download failed:", error);
                    }
                  }}
                >
                  <IconDownload style={{ width: "70%", height: "70%" }} stroke={1.5} />
                </ActionIcon>
              </Group>
            </Box>
            {logos.length > 1 && (
              <Combobox
                store={combobox}
                withinPortal={false}
                onOptionSubmit={(val) => {
                  setSelectedLogo(val);
                  combobox.closeDropdown();
                }}
              >
                <Combobox.Target>
                  <InputBase
                    component="button"
                    type="button"
                    pointer
                    rightSection={<Combobox.Chevron />}
                    onClick={() => combobox.toggleDropdown()}
                    rightSectionPointerEvents="none"
                    multiline
                  >
                    <span>See Other Logos</span>
                  </InputBase>
                </Combobox.Target>

                <Combobox.Dropdown>
                  <Combobox.Options>{options}</Combobox.Options>
                </Combobox.Dropdown>
              </Combobox>
            )}
          </Paper>
        )}

        {companyProfile.hq_lon && companyProfile.hq_lat && isLoaded && (
          <Paper id="hq-map" radius={8} withBorder p={"xs"} style={{ flex: 1 }}>
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
          </Paper>
        )}
      </Stack>
    </Group>
  );
}
