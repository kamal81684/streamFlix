export default function Footer() {
  return (
    <footer className="border-t py-6 text-center text-sm text-muted-foreground">
      &copy; {new Date().getFullYear()} StreamFlix. All rights reserved.
    </footer>
  );
}
