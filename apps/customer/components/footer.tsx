import { ContentContainer } from './layout/content-container';

export function Footer() {
  return (
    <footer className="border-t border-border/50 py-12 md:py-16 bg-background mt-auto">
      <ContentContainer className="flex flex-col md:flex-row justify-between items-center gap-6 text-sm text-muted-foreground font-light">
        <div className="flex flex-col items-center md:items-start space-y-1">
          <span className="font-serif text-lg font-medium text-foreground mb-2">
            Quality Bakers
          </span>
          <span>123 Bakery Lane, Pastry City</span>
          <span>Open Daily: 7am - 7pm</span>
        </div>
        <div className="flex flex-col items-center md:items-end space-y-2">
          <a href="#" className="hover:text-primary transition-colors">
            Instagram
          </a>
          <a href="#" className="hover:text-primary transition-colors">
            Find on Map
          </a>
          <a href="tel:+1234567890" className="hover:text-primary transition-colors">
            +1 (234) 567-890
          </a>
          <span className="mt-4 text-xs opacity-60">
            &copy; {new Date().getFullYear()} Quality Bakers.
          </span>
        </div>
      </ContentContainer>
    </footer>
  );
}
