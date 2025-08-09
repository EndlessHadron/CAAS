export async function GET() {
  return Response.json({ 
    version: 'v56-lj9-no-containers',
    timestamp: new Date().toISOString(),
    logoPath: '/neatly_logo_more_gradient.png',
    authChanges: 'removed containers, h-24 logo, btn-primary styling'
  })
}