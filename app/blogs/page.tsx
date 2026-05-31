export default function BlogsPage() {
  const blogPosts = [
    {
      id: 1,
      title: 'How GitHub uses eBPF to improve deployment safety',
      description:
        'Learn how GitHub uses eBPF to detect and prevent circular dependencies in its deployment tooling.',
      author: 'Lawrence Gripper & Aleksey Levenstein',
      date: 'April 16, 2026',
      image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=500&h=300&fit=crop',
    },
    {
      id: 2,
      title: 'The uphill climb of making diff lines performant',
      description: 'The path to better performance is often found in simplicity.',
      author: 'Luke Ghenco & Adam Shwert',
      date: 'April 3, 2026',
      image: 'https://images.unsplash.com/photo-1516321318423-f06f70d504f0?w=500&h=300&fit=crop',
    },
    {
      id: 3,
      title: 'Continuous AI for accessibility: How GitHub transforms feedback into inclusion',
      description:
        'AI automates triage for accessibility feedback, allowing us to focus on fixing barriers—turning a chaotic backlog into continuous, rapid resolutions.',
      author: 'Carie Fisher',
      date: 'March 12, 2026',
      image: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=500&h=300&fit=crop',
    },
    {
      id: 4,
      title: 'How we rebuilt the search architecture for high availability in GitHub Enterprise Server',
      description:
        'Here\'s how we made the search experience better, faster, and more resilient for GHES customers.',
      author: 'David Tippett',
      date: 'March 3, 2026',
      image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&h=300&fit=crop',
    },
  ];

  return (
    <main className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,#F1F5FD,white_55%)] text-slate-900">
      <div className="pointer-events-none absolute -left-32 top-12 h-72 w-72 rounded-full bg-purple-200/40 blur-3xl" />
      <div className="pointer-events-none absolute right-0 top-0 h-80 w-80 rounded-full bg-indigo-200/30 blur-3xl" />

      <div className="relative mx-auto max-w-6xl px-6 py-16 pt-24">
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-slate-900 md:text-5xl">
            ExpensesTracker Blog
          </h1>
          <p className="mt-4 text-lg text-slate-600">
            Insights, tips, and stories to help you master your finances.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          {blogPosts.map((post) => (
            <article
              key={post.id}
              className="group overflow-hidden rounded-2xl bg-white shadow-sm backdrop-blur transition-all duration-300 hover:shadow-lg hover:scale-105 cursor-pointer"
            >
              <div className="relative h-48 w-full overflow-hidden bg-slate-100">
                <img
                  src={post.image}
                  alt={post.title}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                />
              </div>

              <div className="p-6">
                <h2 className="text-xl font-bold leading-tight text-slate-900 group-hover:text-indigo-600 transition-colors">
                  {post.title}
                </h2>
                <p className="mt-3 text-base text-slate-600 leading-relaxed">
                  {post.description}
                </p>
                <div className="mt-4 border-t border-slate-200 pt-4">
                  <p className="text-sm italic text-slate-500">
                    <span className="font-semibold">{post.author}</span> · {post.date}
                  </p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </main>
  );
}
