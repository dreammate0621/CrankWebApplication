using MongoDB.Driver;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Crankdata.Models
{
    public class CrankdataContext
    {
        string dbConnectionString = string.Empty;
        string dbName = string.Empty;

        MongoClient mongoClient = null;
        IMongoDatabase mongoDb;
        public CrankdataContext( string dbConnectionString = "mongodb://localhost:27017", string dbName="crankdb")
        {
            this.dbConnectionString = dbConnectionString;
            this.dbName = dbName;

            //Call Init()
            Init();
        }

        private void Init()
        {
            mongoClient = new MongoClient(this.dbConnectionString);
            mongoDb = mongoClient.GetDatabase(dbName);
        }

        //Songs Collection
        public IMongoCollection<Song> Songs
        {
            get
            {
                return mongoDb.GetCollection<Song>("songs");
            }
        }

        //Artists collection
        public IMongoCollection<Artist> Artists
        {
            get
            {
                return mongoDb.GetCollection<Artist>("artists");
            }
        }

        //Station collection
        public IMongoCollection<Station> Stations
        {
            get
            {
                return mongoDb.GetCollection<Station>("stations");
            }
        }
    }
}
