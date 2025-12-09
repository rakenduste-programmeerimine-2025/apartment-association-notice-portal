// EditButtonNotice.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import EditButtonNotice from '../components/EditButtonNotice';

// Мокаем Mantine Button
vi.mock('@mantine/core', () => ({
  Button: ({ children, onClick, leftSection, ...props }: any) => {
    // Eemaldame Mantine spetsiifilised prop-sid, mida React ei tunne ära
    const { color, radius, variant, size, ...cleanProps } = props;
    return (
      <button onClick={onClick} {...cleanProps}>
        {leftSection}
        {children}
      </button>
    );
  },
}));

// 
vi.mock('lucide-react', () => ({
  Pencil: () => <span data-testid="pencil-icon">✏️</span>,
}));

describe('EditButtonNotice', () => {
  const mockId = 'notice-id-789';
  const mockOnClick = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    cleanup(); 
  });

  // Test 1: Komponent peaks renderdama muuda nuppu
  it('should render edit button with text "Edit"', () => {
    render(<EditButtonNotice id={mockId} />);
    
    const button = screen.getByRole('button', { name: /edit/i });
    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent('Edit');
  });

  // Test 2: Pliiatsi ikoon peaks olema nähtav
  it('should display pencil icon', () => {
    render(<EditButtonNotice id={mockId} />);
    
    const icon = screen.getByTestId('pencil-icon');
    expect(icon).toBeInTheDocument();
    expect(icon).toHaveTextContent('✏️');
  });

  // Test 3: onClick funktsioon peaks töötama
  it('should call onClick handler when clicked', async () => {
    render(<EditButtonNotice id={mockId} onClick={mockOnClick} />);
    
    const button = screen.getByRole('button', { name: /edit/i });
    await userEvent.click(button);
    
    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });

  // Test 4: Peaks töötama ilma onClick propita
  it('should work correctly without onClick prop', () => {
    // Ei tohiks visata vigu
    expect(() => {
      render(<EditButtonNotice id={mockId} />);
    }).not.toThrow();
    
    const button = screen.getByRole('button', { name: /edit/i });
    expect(button).toBeInTheDocument();
    
    // Nupp peaks olema klikatav (isegi kui midagi ei juhtu)
    expect(button).not.toBeDisabled();
  });

  // Test 5: ID prop peaks olema edastatud (kuigi seda ei kasutata renderdamisel)
  it('should accept id prop', () => {
    const { container } = render(<EditButtonNotice id="unique-notice-id" />);
    
    expect(container).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /edit/i })).toBeInTheDocument();
  });

  // Test 6: Mitmekordsed klikid peaksid korrektselt töötama
  it('should handle multiple clicks correctly', async () => {
    render(<EditButtonNotice id={mockId} onClick={mockOnClick} />);
    
    const button = screen.getByRole('button', { name: /edit/i });
    
    // Teeme kolm klikki
    await userEvent.click(button);
    await userEvent.click(button);
    await userEvent.click(button);
    
    expect(mockOnClick).toHaveBeenCalledTimes(3);
  });

  // Test 7: Nupp peaks olema ligipääsetav (accessible)
  it('should be accessible with proper ARIA attributes', () => {
    render(<EditButtonNotice id={mockId} />);
    
    const button = screen.getByRole('button');
    expect(button).toHaveAccessibleName(/edit/i);
    
    // Ikoon peaks olema olemas (screen readerite jaoks)
    expect(screen.getByTestId('pencil-icon')).toBeInTheDocument();
  });

  // Test 8: Ei tohiks olla konsooli vigu
  it('should not produce console errors', () => {
    const consoleErrorSpy = vi.spyOn(console, 'error');
    
    render(<EditButtonNotice id={mockId} />);
    
    expect(consoleErrorSpy).not.toHaveBeenCalled();
    consoleErrorSpy.mockRestore();
  });

  // Test 9: Nupp peaks olema vaikimisi lubatud
  it('should be enabled by default', () => {
    render(<EditButtonNotice id={mockId} />);
    
    const button = screen.getByRole('button', { name: /edit/i });
    expect(button).toBeEnabled();
    expect(button).not.toBeDisabled();
  });

  // Test 10: Erinevad ID-d peaksid töötama (FIXED VERSION)
  it('should work with different id values', () => {
    const testIds = ['notice-1', 'notice-2', 'long-notice-id-12345'];
    
    testIds.forEach(testId => {
      // Renderdame iga ID-ga eraldi
      const { unmount } = render(<EditButtonNotice id={testId} />);
      
      const button = screen.getByRole('button', { name: /edit/i });
      expect(button).toBeInTheDocument();
      
      // Eemaldame enne järgmise renderdamist
      unmount();
    });
  });

  // Alternatiivne versioon testile 10 (lihtsam)
  it('should accept any string as id', () => {
    // Testime vaid ühte erinevat ID-d
    render(<EditButtonNotice id="different-notice-id-999" />);
    
    const button = screen.getByRole('button', { name: /edit/i });
    expect(button).toBeInTheDocument();
  });

  // Test 11: Kontrollime, et komponent ei muuda oma käitumist sõltuvalt ID-st
  it('should behave consistently regardless of id value', async () => {
    const onClickMock = vi.fn();
    
    render(<EditButtonNotice id="any-id-value" onClick={onClickMock} />);
    
    const button = screen.getByRole('button', { name: /edit/i });
    await userEvent.click(button);
    
    expect(onClickMock).toHaveBeenCalledTimes(1);
  });

  // Test 12: Võimalus kasutada nuppu klaviatuuriga (klahv Tab ja Enter)
  it('should be focusable and usable with keyboard', async () => {
    render(<EditButtonNotice id={mockId} onClick={mockOnClick} />);
    
    const button = screen.getByRole('button', { name: /edit/i });
    
    // Fokusseerime nupu
    button.focus();
    expect(button).toHaveFocus();
    
    // Vajutame Enter klahvi
    await userEvent.keyboard('{Enter}');
    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });

  // Test 13: Nupu sisu peaks olema korrektne
  it('should have correct button content', () => {
    render(<EditButtonNotice id={mockId} />);
    
    const button = screen.getByRole('button', { name: /edit/i });
    
    // Kontrollime, et nupul on ikoon ja tekst
    expect(button.innerHTML).toContain('✏️');
    expect(button.textContent).toContain('Edit');
  });
});