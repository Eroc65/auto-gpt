export async function getServerSideProps() {
  return {
    redirect: {
      destination: "/api/trades-guide",
      permanent: false,
    },
  };
}

export default function FreeGuideRedirectPage() {
  return null;
}
