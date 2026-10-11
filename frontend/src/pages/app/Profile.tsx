import { useEffect, useState } from 'react';
import { getMe, User } from '../../services/authService';
import { getUserProfile, updateUserProfile, changePassword } from '../../services/userService';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { useNavigate } from 'react-router-dom';

export default function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [nom, setNom] = useState('');
  const [prenom, setPrenom] = useState('');
  const [email, setEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [dob, setDob] = useState('2004-08-15');
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const data = await getUserProfile();
        setUser(data);
        setNom(data.nom);
        setPrenom(data.prenom);
        setEmail(data.email);
        if (data.dateNaissance) {
          setDob(data.dateNaissance);
        }
      } catch (err) {
        console.error(err);
        setError("Impossible de charger les informations de l'utilisateur");
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess('');
    setError('');

    try {
      // 1. Update personal info
      const updatedUser = await updateUserProfile({
        nom,
        prenom,
        dateNaissance: dob,
      });
      setUser(updatedUser);

      // 2. Update password if provided
      if (password) {
        if (password !== confirmPassword) {
          setError('Les mots de passe ne correspondent pas');
          return;
        }
        await changePassword({
          //oldPassword: '', // Spring Boot can ignore or check
          currentPassword: currentPassword,
          newPassword: password,
        });
        setCurrentPassword('');
        setPassword('');
        setConfirmPassword('');
        localStorage.removeItem('token');
        navigate('/login');
      }

      setSuccess('Profil mis à jour avec succès !');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error(err);
      setError('Erreur lors de la mise à jour du profil');
    }
  };

  if (loading) return <LoadingSpinner message="Chargement du profil..." />;

  return (
    <>
      <div className="mb-5">
        <h1 className="h1 mb-2">Mon profil</h1>
        <p className="fs-5 text-secondary-custom mb-0">Consultez et modifiez vos informations personnelles.</p>
      </div>

      <div className="row g-4">
        {/* Profile Summary Card */}
        <div className="col-lg-4">
          <div className="profile-card shadow-sm-custom text-center">
            <div className="profile-avatar-container">
              <img
                alt={`${prenom} ${nom}`}
                src="https://static.vecteezy.com/system/resources/previews/048/668/547/non_2x/blue-user-icon-profile-and-account-vector.jpg"
              />
            </div>
            <h2 className="h2 mb-3">{prenom} {nom}</h2>
            <div className="info-row">
              <span className="material-symbols-outlined info-icon">mail</span>
              <span>{email}</span>
            </div>
            <hr className="w-100 my-4 text-muted opacity-25" />
            <div className="info-row">
              <span className="material-symbols-outlined info-icon">cake</span>
              <span>Né le {new Date(dob).toLocaleDateString('fr-FR')}</span>
            </div>
          </div>
        </div>

        {/* Edit Form Card */}
        <div className="col-lg-8">
          <div className="profile-card shadow-sm-custom">
            <h3 className="h3 mb-4 pb-3 border-bottom opacity-75">Informations personnelles</h3>

            {success && <div className="alert alert-success py-2">{success}</div>}
            {error && <div className="alert alert-danger py-2">{error}</div>}

            <form onSubmit={handleSave}>
              <div className="row mb-4">
                <div className="col-md-6 mb-3 mb-md-0">
                  <label className="form-label" htmlFor="prof-prenom">Prénom</label>
                  <input className="form-control" id="prof-prenom" required type="text" value={prenom} onChange={e => setPrenom(e.target.value)} />
                </div>
                <div className="col-md-6">
                  <label className="form-label" htmlFor="prof-nom">Nom</label>
                  <input className="form-control" id="prof-nom" required type="text" value={nom} onChange={e => setNom(e.target.value)} />
                </div>
              </div>
              <div className="mb-4">
                <label className="form-label" htmlFor="prof-email">Email (non modifiable)</label>
                <input className="form-control bg-light" id="prof-email" type="email" value={email} disabled />
              </div>
              <div className="row mb-4">
                <div className="col-md-4 mb-3 mb-md-0">
                  <label className="form-label" htmlFor="prof-password">Mot de passe courant</label>
                  <input className="form-control" id="prof-password" type="password" placeholder="Mot de passe courant" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} />
                </div>
                <div className="col-md-4 mb-3 mb-md-0">
                  <label className="form-label" htmlFor="prof-password">Nouveau mot de passe</label>
                  <input className="form-control" id="prof-password" type="password" placeholder="Nouveau mot de passe" value={password} onChange={e => setPassword(e.target.value)} />
                </div>
                <div className="col-md-4">
                  <label className="form-label" htmlFor="prof-confirm">Confirmer le mot de passe</label>
                  <input className="form-control" id="prof-confirm" type="password" placeholder="Confirmer le mot de passe" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />
                </div>
              </div>
              <div className="mb-5">
                <label className="form-label" htmlFor="prof-dob">Date de naissance</label>
                <input className="form-control" id="prof-dob" required type="date" value={dob} onChange={e => setDob(e.target.value)} />
              </div>
              <div className="d-flex gap-3 flex-column flex-sm-row">
                <button className="btn btn-primary-custom" type="submit">Enregistrer les modifications</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
