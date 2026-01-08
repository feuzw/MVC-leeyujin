"use client";

import ThemeToggle from "./ThemeToggle";

interface HeaderProps {
    title?: string;
    rightContent?: React.ReactNode;
}

export default function Header({ title, rightContent }: HeaderProps) {
    return (
        <header className="border-b border-border-subtle">
            <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12">
                <div className="flex justify-between items-center h-16">
                    {title && (
                        <h1 className="text-xl font-light tracking-tight text-text-primary">{title}</h1>
                    )}
                    <div className="flex items-center gap-4 ml-auto">
                        {rightContent}
                        <ThemeToggle />
                    </div>
                </div>
            </div>
        </header>
    );
}

