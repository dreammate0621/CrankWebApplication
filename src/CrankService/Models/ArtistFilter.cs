using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Crankdata.Models;
using MongoDB.Driver;
using MongoDB.Bson;

namespace CrankService.Models
{
    public class ArtistFilter
    {
        public Guid Mbid { get; set; }
        public string Title { get; set; }
        public string FirstName { get; set; }
        public string MiddleName { get; set; }
        public string LastName { get; set; }
        public string SortName { get; set; }
        public string Type { get; set; }
        public string Gender { get; set; }
        public string Location { get; set; }
        public string IPICode { get; set; }
        public string ISNICode { get; set; }
        public string Description { get; set; }
        public string Bio { get; set; }

        public MongoDB.Driver.FilterDefinition<Artist> ToFilterDefinition()
        {
            var filterDefinition = Builders<Artist>.Filter.Empty; // new BsonDocument()

            if (!string.IsNullOrEmpty(Mbid.ToString()))
            {
                filterDefinition &=
                     Builders<Artist>.Filter.Where(r => r.Mbid.Equals(Mbid));
            }

            if (!string.IsNullOrEmpty(Title))
            {
                filterDefinition &=
                     Builders<Artist>.Filter.Where(r => r.Title.Contains(Title));
            }

            if (!string.IsNullOrEmpty(FirstName))
            {
                filterDefinition &=
                     Builders<Artist>.Filter.Where(r => r.FirstName.Contains(FirstName));
            }
            if (!string.IsNullOrEmpty(MiddleName))
            {
                filterDefinition &=
                     Builders<Artist>.Filter.Where(r => r.MiddleName.Contains(MiddleName));
            }
            if (!string.IsNullOrEmpty(LastName))
            {
                filterDefinition &=
                     Builders<Artist>.Filter.Where(r => r.LastName.Contains(LastName));
            }
            if (!string.IsNullOrEmpty(SortName))
            {
                filterDefinition &=
                     Builders<Artist>.Filter.Where(r => r.SortName.Contains(SortName));
            }

            if (!string.IsNullOrEmpty(Type))
            {
                filterDefinition &=
                     Builders<Artist>.Filter.Where(r => r.Type.Equals(Type));
            }

            if (!string.IsNullOrEmpty(Gender))
            {
                filterDefinition &=
                     Builders<Artist>.Filter.Where(r => r.Gender.Equals(Gender));
            }
            if (!string.IsNullOrEmpty(Location))
            {
                filterDefinition &=
                     Builders<Artist>.Filter.Where(r => r.Location.Contains(Location));
            }
            if (!string.IsNullOrEmpty(IPICode))
            {
                filterDefinition &=
                     Builders<Artist>.Filter.Where(r => r.IPICode.Equals(IPICode));
            }
            if (!string.IsNullOrEmpty(ISNICode))
            {
                filterDefinition &=
                     Builders<Artist>.Filter.Where(r => r.ISNICode.Equals(ISNICode));
            }
            if (!string.IsNullOrEmpty(Description))
            {
                filterDefinition &=
                     Builders<Artist>.Filter.Where(r => r.Description.Contains(Description));
            }
            if (!string.IsNullOrEmpty(Bio))
            {
                filterDefinition &=
                     Builders<Artist>.Filter.Where(r => r.Bio.Contains(Bio));
            }

            return filterDefinition;
        }
    }
}
