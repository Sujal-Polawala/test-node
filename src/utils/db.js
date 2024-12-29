const mongoose = require('mongoose');

// MongoDB Schema
const providerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  isPinned: { type: Boolean, default: false },
});

const Provider = mongoose.model('Provider', providerSchema);

// Get Pinned Providers
const getPinnedProviders = async () => {
  const pinnedProviders = await Provider.find({ isPinned: true });
  return pinnedProviders.map((provider) => provider.name);
};

// Toggle Pin Status
const toggleProviderPin = async (providerName) => {
  const provider = await Provider.findOne({ name: providerName });
  if (!provider) {
    await new Provider({ name: providerName, isPinned: true }).save();
    return `${providerName} has been pinned.`;
  }

  provider.isPinned = !provider.isPinned;
  await provider.save();
  return provider.isPinned
    ? `${providerName} has been pinned.`
    : `${providerName} has been unpinned.`;
};

module.exports = { getPinnedProviders, toggleProviderPin };
