const DEFAULT_GATEWAY = "https://gateway.pinata.cloud/ipfs/";

function normalizeCidPath(value) {
  if (!value) {
    return "";
  }

  if (value.startsWith("ipfs://")) {
    return value.slice("ipfs://".length);
  }

  if (value.includes("/ipfs/")) {
    return value.split("/ipfs/")[1];
  }

  return value;
}

export function resolveIpfsUrl(value) {
  if (!value) {
    return "";
  }

  if (value.startsWith("http://") || value.startsWith("https://")) {
    return value;
  }

  return `${DEFAULT_GATEWAY}${normalizeCidPath(value)}`;
}

export function toIpfsUri(value) {
  if (!value) {
    return "";
  }

  if (value.startsWith("ipfs://")) {
    return value;
  }

  if (value.startsWith("http://") || value.startsWith("https://")) {
    return value;
  }

  return `ipfs://${normalizeCidPath(value)}`;
}
