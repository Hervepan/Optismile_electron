import { CategorySelector } from './components/CategorySelector'

export function SaveSessionPage({ user }: { user: any }) {
    const params = new URLSearchParams(window.location.search);
    const duration = parseInt(params.get('duration') || '0', 10);

    const handleSaved = () => {
        window.api.session.saved();
    };

    return (
        <div className="app-container">
            <CategorySelector 
                duration={duration} 
                onSaved={handleSaved} 
                isAuthenticated={!!user} 
            />
        </div>
    )
}
