"use client";

import {
  ActionIcon,
  Anchor,
  Checkbox,
  Group,
  Image,
  Paper,
  SegmentedControl,
  Table,
  TableTbody,
  TableTd,
  TableTh,
  TableThead,
  TableTr,
} from "@mantine/core";
import {
  GoogleMap,
  InfoWindow,
  Marker,
  useJsApiLoader,
} from "@react-google-maps/api";

import { AddToDealModal } from "./AddToDealModal";
import { DistanceFilter } from "./DistanceFilter";
import { EmployeeCountFilter } from "./EmployeeCountFilter";
import { IconExternalLink } from "@tabler/icons-react";
import Link from "next/link";
import { SearchAndPage } from "../../SearchAndPage";
import { SimilarityBadge } from "./SimilarityBadge";
import { useParams } from "next/navigation";
import { useState } from "react";

interface CompanyWithSimilarity extends CompanyProfile_SB {
  similarity: number;
}

const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

export default function CompanyList({
  sortedCompanies,
  count,
}: {
  sortedCompanies: CompanyWithSimilarity[];
  count: number;
}) {
  const [selectedCompanies, setSelectedCompanies] = useState<number[]>([]);
  const [showMap, setShowMap] = useState("List");
  const [selectedCompany, setSelectedCompany] =
    useState<CompanyWithSimilarity | null>(null);

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: GOOGLE_MAPS_API_KEY || "",
  });

  const handleCheckboxChange = (companyId: number) => {
    setSelectedCompanies((prev) =>
      prev.includes(companyId)
        ? prev.filter((id) => id !== companyId)
        : [...prev, companyId],
    );
  };

  const params = useParams();
  const cmpId = params.cmpId;

  const rows = sortedCompanies?.map((element) => (
    <TableTr key={element.id}>
      <TableTd>
        <Checkbox
          checked={selectedCompanies.includes(element.id)}
          onChange={() => handleCheckboxChange(element.id)}
          styles={{
            root: { cursor: "pointer" },
            input: { cursor: "pointer" },
            label: { cursor: "pointer" },
          }}
        />
      </TableTd>
      <TableTd>
        <Group>
          {element.favicon != null && (
            <Image src={element.favicon} width={16} height={16} />
          )}
          <Anchor
            c={"dark"}
            fw={500}
            component={Link}
            href={`/portal/companies/${element.id}/overview#cmp=${cmpId}`}
          >
            {element.name || element.origin}
          </Anchor>
        </Group>
      </TableTd>
      <TableTd>
        <SimilarityBadge similarity={element.similarity} />
      </TableTd>
      <TableTd>{element.description}</TableTd>
      <TableTd>
        {element.origin && (
          <Group>
            <Anchor href={element.origin} c={"dark"} target="_blank">
              {new URL(element.origin ?? "").hostname}
            </Anchor>
            <IconExternalLink size={16} />
          </Group>
        )}
      </TableTd>
    </TableTr>
  ));

  return (
    <>
      <Paper shadow="xs" p="md" mb="md">
        <Group justify="space-between">
          <Group>
            <SearchAndPage totalCount={count} />
            <DistanceFilter />
            <EmployeeCountFilter />
            <SegmentedControl data={["List", "Map"]} onChange={setShowMap} />
          </Group>
          <AddToDealModal selectedCompanies={selectedCompanies} />
        </Group>
      </Paper>

      {showMap == "Map" && isLoaded ? (
        <Paper shadow="xs" p="md" mb="md">
          <GoogleMap
            mapContainerStyle={{ width: "100%", height: "500px" }}
            center={{
              lat: sortedCompanies[0]?.hq_lat || -101.3726549,
              lng: sortedCompanies[0]?.hq_lon || 39.782531,
            }}
            zoom={10}
            options={{
              streetViewControl: false,
            }}
          >
            {sortedCompanies.map(
              (company) =>
                company.hq_lat &&
                company.hq_lon && (
                  <Marker
                    key={company.id}
                    position={{
                      lat: company.hq_lat,
                      lng: company.hq_lon,
                    }}
                    icon={
                      company.favicon
                        ? {
                            url: company.favicon,
                            scaledSize: new google.maps.Size(32, 32),
                          }
                        : undefined
                    }
                    onClick={() => setSelectedCompany(company)}
                  />
                ),
            )}
            {selectedCompany && (
              <InfoWindow
                position={{
                  lat: selectedCompany.hq_lat || 0,
                  lng: selectedCompany.hq_lon || 0,
                }}
                onCloseClick={() => setSelectedCompany(null)}
              >
                <div
                  style={{
                    maxWidth: "250px",
                    padding: "5px 5px",
                    position: "relative",
                  }}
                >
                  <ActionIcon
                    p={"s"}
                    variant="subtle"
                    component={Link}
                    href={`/portal/companies/${selectedCompany.id}/overview#cmp=${cmpId}`}
                    size="xl"
                    aria-label="Open in a new tab"
                    style={{ position: "absolute" }}
                  >
                    <IconExternalLink size={20} />
                  </ActionIcon>
                  {selectedCompany.favicon ? (
                    <div style={{ textAlign: "center", marginBottom: "10px" }}>
                      <img
                        src={selectedCompany.favicon}
                        alt={`${selectedCompany.name} favicon`}
                        style={{
                          width: "32px",
                          height: "32px",
                          objectFit: "contain",
                        }}
                      />
                    </div>
                  ) : (
                    <div style={{ textAlign: "center", marginBottom: "10px" }}>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="32"
                        height="32"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        style={{ color: "#4A90E2" }}
                      >
                        <path d="M12 2C8.13 2 5 5.13 5 9c0 3.22 6.57 10.74 6.86 11.16a1 1 0 0 0 1.28 0C13.43 19.74 20 12.22 20 9c0-3.87-3.13-7-8-7zm0 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z" />
                      </svg>
                    </div>
                  )}
                  <h3
                    style={{
                      margin: "0",
                      fontSize: "16px",
                      textAlign: "center",
                    }}
                  >
                    {selectedCompany.name}
                  </h3>
                  <p
                    style={{
                      marginTop: "5px",
                      fontSize: "14px",
                      textAlign: "center",
                    }}
                  >
                    {selectedCompany.description || "No description available"}
                  </p>
                </div>
              </InfoWindow>
            )}
          </GoogleMap>
        </Paper>
      ) : (
        <Table>
          <TableThead>
            <TableTr>
              <TableTd>
                <Checkbox
                  checked={selectedCompanies.length === sortedCompanies.length}
                  onChange={() => {
                    if (selectedCompanies.length === sortedCompanies.length) {
                      setSelectedCompanies([]);
                    } else {
                      setSelectedCompanies(
                        sortedCompanies.map((company) => company.id),
                      );
                    }
                  }}
                  indeterminate={
                    selectedCompanies.length > 0 &&
                    selectedCompanies.length < sortedCompanies.length
                  }
                  styles={{
                    root: { cursor: "pointer" },
                    input: { cursor: "pointer" },
                    label: { cursor: "pointer" },
                  }}
                />
              </TableTd>
              <TableTh>Name</TableTh>
              <TableTh>Relevance</TableTh>
              <TableTh>Description</TableTh>
              <TableTh>Website</TableTh>
            </TableTr>
          </TableThead>
          <TableTbody>{rows}</TableTbody>
        </Table>
      )}
    </>
  );
}
