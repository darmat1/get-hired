export async function fetchLinkedInProfile(accessToken: string) {
  try {
    const profileResponse = await fetch('https://api.linkedin.com/v2/people/~:({firstName,lastName,emailAddress,headline,summary,location,profilePicture(displayImage~:playableStreams)})', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (!profileResponse.ok) {
      throw new Error('Failed to fetch LinkedIn profile');
    }

    const profile = await profileResponse.json();

    const experienceResponse = await fetch('https://api.linkedin.com/v2/people/~:{positions}', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    const experienceData = await experienceResponse.json();

    const educationResponse = await fetch('https://api.linkedin.com/v2/people/~:{educations}', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    const educationData = await educationResponse.json();

    const skillsResponse = await fetch('https://api.linkedin.com/v2/people/~:{skills}', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    const skillsData = await skillsResponse.json();

    return {
      id: profile.id,
      firstName: profile.firstName.localized.en_US,
      lastName: profile.lastName.localized.en_US,
      email: profile.emailAddress,
      headline: profile.headline,
      summary: profile.summary || '',
      location: profile.localizedName || '',
      phone: '',
      website: '',
      experience: experienceData.elements || [],
      education: educationData.elements || [],
      skills: skillsData.elements || []
    };
  } catch (error) {
    console.error('LinkedIn API error:', error);
    throw error;
  }
}