import { CategorySelector } from '@/features/timer/components/CategorySelector'

export function SaveSessionPage({ user }: { user: any }) {
    const params = new URLSearchParams(window.location.search);
    const duration = parseInt(params.get('duration') || '0', 10);

    const handleSaved = () => {
        window.api.session.saved();
    };

    return (
        <div className="app-container h-screen overflow-hidden">
            <CategorySelector 
                duration={duration} 
                onSaved={handleSaved} 
                isAuthenticated={!!user} 
            />
        </div>
    )
}
