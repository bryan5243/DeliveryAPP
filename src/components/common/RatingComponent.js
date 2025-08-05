import React, { useState } from 'react';
import { Star, MessageCircle, ThumbsUp, ThumbsDown, Send } from 'lucide-react';

const RatingComponent = ({ restaurantId, onRatingSubmit, existingRatings = [] }) => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [review, setReview] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [filter, setFilter] = useState('all'); // all, 5, 4, 3, 2, 1

  const handleRatingSubmit = async () => {
    if (rating === 0) return;
    
    setIsSubmitting(true);
    
    const newRating = {
      id: Date.now(),
      restaurantId,
      userId: 'current-user-id', // Obtener del contexto/auth
      userName: 'Usuario Actual',
      rating,
      review: review.trim(),
      timestamp: new Date().toISOString(),
      helpful: 0,
      reported: false
    };

    try {
      await onRatingSubmit(newRating);
      setRating(0);
      setReview('');
      setShowReviewForm(false);
    } catch (error) {
      console.error('Error al enviar calificación:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStars = (currentRating, interactive = false) => {
    return Array.from({ length: 5 }, (_, index) => {
      const starValue = index + 1;
      const isActive = interactive 
        ? starValue <= (hoverRating || rating)
        : starValue <= currentRating;
      
      return (
        <Star
          key={index}
          className={`w-6 h-6 cursor-pointer transition-colors ${
            isActive 
              ? 'text-yellow-400 fill-yellow-400' 
              : 'text-gray-300'
          }`}
          onClick={() => interactive && setRating(starValue)}
          onMouseEnter={() => interactive && setHoverRating(starValue)}
          onMouseLeave={() => interactive && setHoverRating(0)}
        />
      );
    });
  };

  const getAverageRating = () => {
    if (existingRatings.length === 0) return 0;
    const total = existingRatings.reduce((sum, rating) => sum + rating.rating, 0);
    return (total / existingRatings.length).toFixed(1);
  };

  const getRatingDistribution = () => {
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    existingRatings.forEach(rating => {
      distribution[rating.rating]++;
    });
    return distribution;
  };

  const filteredRatings = filter === 'all' 
    ? existingRatings 
    : existingRatings.filter(r => r.rating === parseInt(filter));

  const distribution = getRatingDistribution();
  const totalRatings = existingRatings.length;

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      {/* Header con estadísticas */}
      <div className="mb-6">
        <h3 className="text-xl font-bold mb-4">Calificaciones y Reseñas</h3>
        
        <div className="flex items-center space-x-6 mb-4">
          <div className="text-center">
            <div className="text-3xl font-bold text-orange-500">
              {getAverageRating()}
            </div>
            <div className="flex justify-center mb-1">
              {renderStars(parseFloat(getAverageRating()))}
            </div>
            <div className="text-sm text-gray-600">
              {totalRatings} reseñas
            </div>
          </div>
          
          <div className="flex-1">
            {[5, 4, 3, 2, 1].map(stars => (
              <div key={stars} className="flex items-center space-x-2 mb-1">
                <span className="text-sm w-8">{stars}</span>
                <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-yellow-400 h-2 rounded-full transition-all"
                    style={{ 
                      width: `${totalRatings ? (distribution[stars] / totalRatings) * 100 : 0}%` 
                    }}
                  />
                </div>
                <span className="text-sm text-gray-600 w-8">
                  {distribution[stars]}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Botón para calificar */}
      {!showReviewForm && (
        <button
          onClick={() => setShowReviewForm(true)}
          className="w-full bg-orange-500 text-white py-3 rounded-lg hover:bg-orange-600 mb-6 flex items-center justify-center space-x-2"
        >
          <Star className="w-5 h-5" />
          <span>Calificar este restaurante</span>
        </button>
      )}

      {/* Formulario de calificación */}
      {showReviewForm && (
        <div className="bg-gray-50 p-4 rounded-lg mb-6">
          <h4 className="font-semibold mb-3">Tu calificación</h4>
          
          <div className="flex items-center space-x-2 mb-4">
            <span className="text-sm">Calificación:</span>
            <div className="flex space-x-1">
              {renderStars(rating, true)}
            </div>
          </div>

          <textarea
            value={review}
            onChange={(e) => setReview(e.target.value)}
            placeholder="Escribe tu reseña (opcional)..."
            className="w-full p-3 border border-gray-300 rounded-lg resize-none h-24 mb-4"
            maxLength={500}
          />

          <div className="flex space-x-3">
            <button
              onClick={handleRatingSubmit}
              disabled={rating === 0 || isSubmitting}
              className="flex-1 bg-orange-500 text-white py-2 rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              <Send className="w-4 h-4" />
              <span>{isSubmitting ? 'Enviando...' : 'Enviar Calificación'}</span>
            </button>
            <button
              onClick={() => {
                setShowReviewForm(false);
                setRating(0);
                setReview('');
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Filtros */}
      <div className="flex space-x-2 mb-4 overflow-x-auto">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-full text-sm whitespace-nowrap ${
            filter === 'all' 
              ? 'bg-orange-500 text-white' 
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Todas ({totalRatings})
        </button>
        {[5, 4, 3, 2, 1].map(stars => (
          <button
            key={stars}
            onClick={() => setFilter(stars.toString())}
            className={`px-4 py-2 rounded-full text-sm whitespace-nowrap flex items-center space-x-1 ${
              filter === stars.toString()
                ? 'bg-orange-500 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            <span>{stars}</span>
            <Star className="w-3 h-3" />
            <span>({distribution[stars]})</span>
          </button>
        ))}
      </div>

      {/* Lista de reseñas */}
      <div className="space-y-4">
        {filteredRatings.length === 0 ? (
          <div className="text-center py-8">
            <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500">
              {filter === 'all' 
                ? 'No hay reseñas aún' 
                : `No hay reseñas con ${filter} estrella${filter === '1' ? '' : 's'}`
              }
            </p>
          </div>
        ) : (
          filteredRatings.map(rating => (
            <div key={rating.id} className="border-b border-gray-200 pb-4">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center text-white font-semibold">
                    {rating.userName.charAt(0)}
                  </div>
                  <div>
                    <div className="font-semibold">{rating.userName}</div>
                    <div className="flex items-center space-x-2">
                      <div className="flex space-x-1">
                        {renderStars(rating.rating)}
                      </div>
                      <span className="text-sm text-gray-500">
                        {new Date(rating.timestamp).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              
              {rating.review && (
                <p className="text-gray-700 mb-3 ml-13">{rating.review}</p>
              )}
              
              <div className="flex items-center space-x-4 ml-13">
                <button className="flex items-center space-x-1 text-gray-500 hover:text-orange-500">
                  <ThumbsUp className="w-4 h-4" />
                  <span className="text-sm">Útil ({rating.helpful})</span>
                </button>
                <button className="flex items-center space-x-1 text-gray-500 hover:text-red-500">
                  <ThumbsDown className="w-4 h-4" />
                  <span className="text-sm">Reportar</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default RatingComponent;