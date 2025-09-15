export default function Header() {
    return (
        <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <div className="h-8 w-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                                <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                            </div>
                        </div>
                        <div className="ml-3">
                            <h1 className="text-xl font-bold text-gray-900">EventPro</h1>
                        </div>
                    </div>

                    {/* Navigation */}
                    <nav className="hidden md:flex space-x-8">
                        <a href="#" className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium transition-colors duration-200">Features</a>
                        <a href="#" className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium transition-colors duration-200">Pricing</a>
                        <a href="#" className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium transition-colors duration-200">About</a>
                        <a href="#" className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium transition-colors duration-200">Contact</a>
                    </nav>

                    {/* CTA Buttons */}
                    <div className="flex items-center space-x-4">
                        <button className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium transition-colors duration-200">
                            Sign In
                        </button>
                        <button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-105">
                            Get Started
                        </button>
                    </div>

                    {/* Mobile menu button */}
                    <div className="md:hidden">
                        <button className="text-gray-600 hover:text-gray-900 p-2">
                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        </header>
    )
}
