import { Group, Image } from "@mantine/core";

export default function SelectLogoOption({ logo }: { logo: string }) {
  return (
    <Group>
      <Image src={logo} width={30} height={30} fit="contain" alt="" />
    </Group>
  );
}
